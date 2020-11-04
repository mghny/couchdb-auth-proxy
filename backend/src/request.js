import axios from "axios";

export const anonymousInstance = axios.create({
  baseURL: "http://localhost:5984",
});

export const adminInstance = axios.create({
  baseURL: "http://localhost:5984",
  headers: {
    "X-Auth-CouchDB-UserName": "admin",
    "X-Auth-CouchDB-Roles": "_admin",
    "X-Auth-CouchDB-Token": "c7c0dac6630bf52581bf11ee4abe424173ec57af",
  },
});

export const streamerInstance = axios.create({
  baseURL: "http://localhost:5984",
  headers: {
    // "X-Auth-CouchDB-UserName": streamer.name,
    // "X-Auth-CouchDB-Roles": "streamer",
    // "X-Auth-CouchDB-Token": hmac(streamer.name),
  },
});
