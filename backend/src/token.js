import { readFileSync } from "fs";
import { resolve } from "path";
import { sign } from "jsonwebtoken";

// openssl genrsa -out key.pem 2048
// openssl rsa -in key.pem -outform PEM -pubout -out public.pem
const keyPath = resolve(process.cwd(), "certs/key.pem");
const privateKey = readFileSync(keyPath);

export const signStreamerToken = (streamer) => {
  const token = sign(
    {
      "_couchdb.roles": ["streamer"],
    },
    privateKey,
    {
      algorithm: "RS256",
      subject: streamer.truncated,
      expiresIn: "1h",
    }
  );

  return token;
};
