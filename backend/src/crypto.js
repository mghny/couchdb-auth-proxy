import { createHash, createHmac } from "crypto";

export const hashSha256 = (data) =>
  createHash("sha256").update(data, "utf8").digest("hex");

export const hmacSha1 = (data, secret) =>
  createHmac("sha1", secret).update(data, "utf8").digest("hex");
