import PouchDB from "pouchdb";
import PouchUpsert from "pouchdb-upsert";
import { atom } from "recoil";
import { equals, find, omit, pipe, propEq, propOr, when } from "ramda";

import { getToken } from "./token";

PouchDB.plugin(PouchUpsert);

const isTruhty = pipe(Boolean, equals(true));

const host = "http://localhost:8080/api/v1";

const authenticatedPouchFetch = (url, opts) => {
  const token = getToken();

  if (token) {
    opts.headers.set("Authorization", `Bearer ${token}`);
  }

  return PouchDB.fetch(url, opts);
};

const localUserDB = new PouchDB(`user`);
const localConfigurationDB = new PouchDB(`configuration`);
const remoteUserDB = new PouchDB(`${host}/user`, {
  fetch: authenticatedPouchFetch,
});
const remoteConfigurationDB = new PouchDB(`${host}/configuration`, {
  fetch: authenticatedPouchFetch,
});

const syncPouchDocumentEffect = (local, remote, docId) => ({
  setSelf,
  trigger,
  onSet,
}) => {
  if (trigger === "get") {
    setSelf({});
  }

  let cancel = () => {};

  onSet((newValue) => {
    local.upsert(docId, () => omit(["_id", "_rev"], newValue));
  });

  const replication = local.replicate.from(remote);

  replication.on("complete", () => {
    local.get(docId).then(setSelf);

    const sync = local.sync(remote, {
      since: "now",
      live: true,
      include_docs: true,
      doc_ids: [docId],
    });

    sync.on("change", ({ direction, change }) => {
      if (direction === "pull") {
        pipe(
          propOr([], "docs"),
          find(propEq("_id", docId)),
          omit(["_revisions"]),
          when(isTruhty, setSelf)
        )(change);
      }
    });

    cancel = () => sync.cancel();
  });

  return () => {
    cancel();
  };
};

export const userState = atom({
  key: "UserState",
  default: null,
  effects_UNSTABLE: [
    syncPouchDocumentEffect(localUserDB, remoteUserDB, "user"),
  ],
});

export const configurationState = atom({
  key: "Configuration",
  default: null,
  effects_UNSTABLE: [
    syncPouchDocumentEffect(
      localConfigurationDB,
      remoteConfigurationDB,
      "configuration"
    ),
  ],
});
