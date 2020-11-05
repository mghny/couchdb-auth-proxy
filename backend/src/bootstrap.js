import { chain, fork, map, parallel, Future } from "fluture";
import { assoc, objOf } from "ramda";

import { hashSha256 } from "./crypto";
import { createWallet, getMnemonic } from "./monero";
import { addStreamer } from "./streamer";

const secret = "92de07df7e7a3fe14808cef90a7cc0d91";

const sequence = parallel(1);
const log = (label) => console.log.bind(null, label);
const forkTask = fork(log("rejection"))(log("resolution"));

export function bootstrapStreamers() {
  const streamers = ["alex", "grischa", "jonas"];
  const streamerTasks = streamers.map((name) =>
    createWallet({ password: name })
      .pipe(chain(getMnemonic))
      .pipe(
        map((mnemonic) => ({
          mnemonic,
          hash: hashSha256(mnemonic, secret),
        }))
      )
      .pipe(
        map((seeds) => ({
          ...seeds,
          truncated: seeds.hash.substr(0, 32),
        }))
      )
      .pipe(chain(addStreamer))
  );

  forkTask(sequence(streamerTasks));
}
