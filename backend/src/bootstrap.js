import { chain, fork, map, parallel } from "fluture";
import { assoc, objOf } from "ramda";

import { hashSha256 } from "./crypto";
import { createWallet, getMnemonic } from "./monero";
import {
  addStreamer,
  addStreamerUserStore,
  addStreamerConfigurationStore,
  addStreamerUserSecurity,
  addStreamerConfigurationSecurity,
  addStreamerUser,
  addStreamerConfiguration,
} from "./streamer";

const log = (label) => console.log.bind(null, label);

export function bootstrapStreamers() {
  const users = ["alex", "grischa", "jonas"].map((name) =>
    createWallet(name)
      .pipe(chain(getMnemonic))
      .pipe(map(objOf("mnemonic")))
      .pipe(
        map((secrets) =>
          assoc(
            "seed",
            hashSha256(secrets.mnemonic, "92de07df7e7a3fe14808cef90a7cc0d91"),
            secrets
          )
        )
      )
      .pipe(
        chain((secrets) =>
          // move into streamer user store
          // keep user document as small as possible
          addStreamer({ ...secrets, name: name, password: name })
            .pipe(chain(() => addStreamerUserStore(name)))
            .pipe(chain(() => addStreamerUserSecurity(name)))
            .pipe(chain(() => addStreamerUser(name)))
            .pipe(chain(() => addStreamerConfigurationStore(name)))
            .pipe(chain(() => addStreamerConfigurationSecurity(name)))
            .pipe(chain(() => addStreamerConfiguration(name)))
        )
      )
  );

  parallel(3)(users).pipe(fork(log("rejection"))(log("resolution")));
}
