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

function main() {
  const users = ["alex", "grischa", "jonas"].map(
    (name) =>
      createWallet()
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
          )
        )
        // .pipe(chain(() => addStreamerStore(name)))
        .pipe(chain(() => addStreamerUserStore(name)))
        .pipe(chain(() => addStreamerUserSecurity(name)))
        .pipe(chain(() => addStreamerUser(name)))
        .pipe(chain(() => addStreamerConfigurationStore(name)))
        .pipe(chain(() => addStreamerConfigurationSecurity(name)))
        .pipe(chain(() => addStreamerConfiguration(name)))

    //   .pipe(map((response) => response.data))
    //   .pipe(mapRej((error) => error.response.data))
  );

  parallel(3)(users).pipe(fork(log("rejection"))(log("resolution")));

  //   getStreamers()
  //   addStreamer({ name: "alex", password: "alex" })
  //   addStreamer({ name: "grischa", password: "grischa" })
  //   addStreamer({ name: "jonas", password: "jonas" })
  // .pipe(
  //   map((x) => {
  //     console.log({ x });
  //     return x;
  //   })
  // )
  // .pipe(map((response) => response.data))
  // .pipe(map((response) => response))
  // .pipe(mapRej((error) => error.response.data))
  // .pipe(fork(log("rejection"))(log("resolution")));

  //   const wallet = createWallet();
  //   const mnemonic = wallet.getMnemonic();

  //   console.log(wallet);

  //   mnemonic.then(console.log).catch(console.error);
}

main();
