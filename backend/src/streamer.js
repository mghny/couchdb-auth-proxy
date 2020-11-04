import { attemptP, map, mapRej } from "fluture";
import { adminInstance } from "./request";

const fetchF = (config) => attemptP(() => adminInstance.request(config));

// use custom database for streamers
export const addStreamer = (streamer) =>
  fetchF({
    method: "put",
    url: `/_users/org.couchdb.user:${streamer.name}`,
    data: {
      ...streamer,
      id: streamer.name,
      roles: ["streamer", "user"],
      type: "user",
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej((error) => error.response));

// streamer user database
export const addStreamerUserStore = (name) =>
  fetchF({
    method: "put",
    url: `/streamer_user_${name}`,
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej((error) => error.response));

// streamer configuration database
export const addStreamerConfigurationStore = (name) =>
  fetchF({
    method: "put",
    url: `/streamer_configuration_${name}`,
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej((error) => error.response));

// streamer user security
export const addStreamerUserSecurity = (name) =>
  fetchF({
    method: "put",
    url: `/streamer_user_${name}/_security`,
    data: {
      admins: {
        names: ["admin"],
        roles: [],
      },
      members: {
        names: ["admin"],
        roles: [],
      },
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej((error) => error.response));

// streamer configuration security
export const addStreamerConfigurationSecurity = (name) =>
  fetchF({
    method: "put",
    url: `/streamer_configuration_${name}/_security`,
    data: {
      admins: {
        names: ["admin"],
        roles: [],
      },
      members: {
        names: ["admin", name],
        roles: [],
      },
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej((error) => error.response));

// streamer user document
export const addStreamerUser = (name) =>
  fetchF({
    method: "put",
    url: `/streamer_user_${name}/user`,
    data: {
      name,
      foo: "bar",
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej((error) => error.response));

// streamer configuration document
export const addStreamerConfiguration = (name) =>
  fetchF({
    method: "put",
    url: `/streamer_configuration_${name}/configuration`,
    data: {
      name,
      foo: "baz",
    },
  })
    .pipe(map((response) => response.data))
    .pipe(mapRej((error) => error.response));

export const getStreamers = () =>
  fetchF({
    method: "post",
    url: `/_users/_find`,
    data: {
      fields: ["name"],
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
    .pipe(mapRej((error) => error.response));

export const findStreamerBySeed = (seed) =>
  fetchF({
    method: "post",
    url: `/_users/_find`,
    data: {
      fields: ["name", "seed"],
      selector: {
        seed: seed,
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
    .pipe(mapRej((error) => error.response));

// design document to enforce non admin read only access
const ddAuthRO = {
  _id: "_design/authorize_read_only",
  validate_doc_update: `
    function(newDoc, oldDoc, userCtx) {
        var IS_DB_ADMIN = false;

        if (~userCtx.roles.indexOf('_admin')) {
            IS_DB_ADMIN = true;
        }
        
        if (IS_DB_ADMIN) {
            log('Admin change on read-only db: ' + newDoc._id);
        } else {
            throw({ forbidden : 'read only' });
        }
    }
    `,
};

const ddAuthRW = {
  _id: "_design/authorize_read_write",
  validate_doc_update: `
    function(newDoc, oldDoc, userCtx) {
        throw({ forbidden : 'not able now!' });
    }
    `,
};
