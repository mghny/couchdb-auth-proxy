import { attemptP, chain, map, mapRej } from "fluture";
import { adminInstance } from "./request";

const fetchF = (config) => attemptP(() => adminInstance.request(config));
const handleRequestError = (error) => {
  const failure = {};
  // const failure = { config: error.config };

  if (error.response) {
    failure.response = {};
    failure.response.data = error.response.data;
    failure.response.status = error.response.status;
    failure.response.headers = error.response.headers;
    // } else if (error.request) {
    //   console.error(error);
    //   failure.request = error.request;
  } else {
    failure.message = error.message;
  }

  return failure;
};

// use custom database for streamers
export const addStreamerUser = (streamer) =>
  fetchF({
    method: "put",
    url: `/_users/org.couchdb.user:${streamer.truncated}`,
    data: {
      name: streamer.truncated,
      // remove after testing
      ...streamer,
      roles: ["streamer"],
      type: "user",
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer user database
export const addStreamerProfileStore = (id) =>
  fetchF({
    method: "put",
    url: `/profile_${id}`,
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer configuration database
export const addStreamerConfigurationStore = (id) =>
  fetchF({
    method: "put",
    url: `/configuration_${id}`,
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer user security
export const addStreamerProfileSecurity = (id) =>
  fetchF({
    method: "put",
    url: `/profile_${id}/_security`,
    data: {
      admins: {
        names: ["admin"],
        roles: [],
      },
      members: {
        names: [id],
        roles: [],
      },
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer configuration security
export const addStreamerConfigurationSecurity = (id) =>
  fetchF({
    method: "put",
    url: `/configuration_${id}/_security`,
    data: {
      admins: {
        names: ["admin"],
        roles: [],
      },
      members: {
        names: [id],
        roles: [],
      },
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer user document
export const addStreamerProfile = (id) =>
  fetchF({
    method: "put",
    url: `/profile_${id}/profile`,
    data: {
      // id,
      foo: "bar",
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer configuration document
export const addStreamerConfiguration = (id) =>
  fetchF({
    method: "put",
    url: `/configuration_${id}/configuration`,
    data: {
      // id,
      foo: "baz",
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer user document
export const addStreamerProfileProtection = (id) =>
  fetchF({
    method: "put",
    url: `/profile_${id}/_design/authorize_ro_protection`,
    data: getReadOnlyProtectionDesignDocument(),
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

// streamer configuration document
export const addStreamerConfigurationProtection = (id) =>
  fetchF({
    method: "put",
    url: `/configuration_${id}/_design/authorize_rw_protection`,
    data: getReadWriteProtectionDesignDocument(id),
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej(handleRequestError));

export const addStreamer = (streamer) =>
  addStreamerUser(streamer)
    .pipe(chain(() => addStreamerProfileStore(streamer.truncated)))
    .pipe(chain(() => addStreamerProfileSecurity(streamer.truncated)))
    .pipe(chain(() => addStreamerProfileProtection(streamer.truncated)))
    .pipe(chain(() => addStreamerProfile(streamer.truncated)))
    .pipe(chain(() => addStreamerConfigurationStore(streamer.truncated)))
    .pipe(chain(() => addStreamerConfigurationSecurity(streamer.truncated)))
    .pipe(chain(() => addStreamerConfigurationProtection(streamer.truncated)))
    .pipe(chain(() => addStreamerConfiguration(streamer.truncated)));

export const getStreamers = () =>
  fetchF({
    method: "post",
    url: `/_users/_find`,
    data: {
      // fields: ["name"],
      selector: {
        roles: {
          $elemMatch: {
            $eq: "streamer",
          },
        },
      },
    },
  })
    .pipe(map((response) => response.data.docs))
    .pipe(mapRej(handleRequestError));

export const findStreamerBySeed = (seed) =>
  fetchF({
    method: "post",
    url: `/_users/_find`,
    data: {
      // fields: ["name", "seed"],
      selector: {
        hash: seed,
        roles: {
          $elemMatch: {
            $eq: "streamer",
          },
        },
      },
    },
  })
    .pipe(map((response) => response.data.docs))
    .pipe(map((docs) => docs[0]))
    .pipe(mapRej(handleRequestError));

// https://github.com/pouchdb-community/pouchdb-authentication/blob/master/docs/recipes.md#some-people-can-read-some-docs-some-people-can-write-those-same-docs
const getReadOnlyProtectionDesignDocument = () => ({
  validate_doc_update: `
    function(newDoc, oldDoc, userCtx) {
      var IS_DB_ADMIN = false;

      if (~userCtx.roles.indexOf('_admin')) {
        IS_DB_ADMIN = true;
      }
        
      if (IS_DB_ADMIN) {
        return;
      } else {
        throw({ forbidden : 'read only' });
      }
    }
  `.replace("\n", ""),
});

const getReadWriteProtectionDesignDocument = (name) => ({
  validate_doc_update: `
    function(newDoc, oldDoc, userCtx) {
      var IS_DB_ADMIN = false;
      var IS_DB_MEMBER = false;

      if (~userCtx.roles.indexOf('_admin')) {
        IS_DB_ADMIN = true;
      }

      if (userCtx.name === '${name}') {
        IS_DB_MEMBER = true;
      }
        
      if (IS_DB_ADMIN || IS_DB_MEMBER) {
        return;
      } else {
        throw({ forbidden : 'not a member' });
      }
    }
  `.replace("\n", ""),
});
