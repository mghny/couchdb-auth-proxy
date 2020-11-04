import { propOr } from "ramda";
import { anonymousInstance } from "./request";

export const getUserContext = (authorization) =>
  anonymousInstance
    .get("/_session", {
      headers: {
        authorization,
      },
    })
    .then((response) => response.data)
    .then(propOr({}, "userCtx"));
