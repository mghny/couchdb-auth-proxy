import { createServer } from "http";

import cors from "cors";
import express from "express";
import { fork, map } from "fluture";
import { createProxyMiddleware } from "http-proxy-middleware";
import SocketIO from "socket.io";

import { findStreamerBySeed } from "./streamer";
import { getUserContext } from "./session";
import { signStreamerToken } from "./token";

export function bootstrap() {}

// thank you kent
// https://github.com/kentcdodds/express-app-example/blob/master/src/start.js
export function startServer({ port }) {
  const app = express();
  const server = createServer(app);
  const io = SocketIO(server);

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    "/api/v1/user",
    createProxyMiddleware({
      target: "http://localhost:5984",
      changeOrigin: true,
      pathRewrite: (path, request) =>
        getUserContext(request.headers.authorization)
          .then((context) => context.name)
          .then((name) =>
            path.replace("/api/v1/user", `/streamer_user_${name}`)
          ),
    })
  );

  app.use(
    "/api/v1/configuration",
    createProxyMiddleware({
      target: "http://localhost:5984",
      changeOrigin: true,
      pathRewrite: (path, request) =>
        getUserContext(request.headers.authorization)
          .then((context) => context.name)
          .then((name) =>
            path.replace(
              "/api/v1/configuration",
              `/streamer_configuration_${name}`
            )
          ),
    })
  );

  // app.use(
  //   "/api/v1",
  //   createProxyMiddleware({
  //     target: "http://localhost:5984",
  //     changeOrigin: true,
  //   })
  // );

  io.on("connect", (socket) => {
    console.log("connect", socket.id);

    socket.on("login", ({ seed }, fn) => {
      findStreamerBySeed(seed)
        .pipe(map(signStreamerToken))
        .pipe(
          fork((error) => {
            console.error({ error });
            fn({ ok: false, error });
          })((token) => {
            fn({ ok: true, token });
          })
        );
    });

    socket.on("disconnect", () => {
      console.log("disconnect", socket.id);
    });
  });

  return new Promise((resolve) => {
    server.listen(port, () => {
      console.log(`App listening on port ${port}`);
      const originalClose = server.close.bind(server);

      server.close = () => {
        return new Promise((resolveClose) => {
          originalClose(resolveClose);
        });
      };

      setupCloseOnExit(server);
      resolve(server);
    });
  });
}

function setupCloseOnExit(server) {
  // thank you stack overflow
  // https://stackoverflow.com/a/14032965/971592
  async function exitHandler(options = {}) {
    await server
      .close()
      .then(() => {
        log.info("Server successfully closed");
      })
      .catch((e) => {
        log.warn("Something went wrong closing the server", e.stack);
      });

    // eslint-disable-next-line no-process-exit
    if (options.exit) {
      process.exit();
    }
  }

  // do something when app is closing
  process.on("exit", exitHandler);

  // catches ctrl+c event
  process.on("SIGINT", exitHandler.bind(null, { exit: true }));

  // catches "kill pid" (for example: nodemon restart)
  process.on("SIGUSR1", exitHandler.bind(null, { exit: true }));
  process.on("SIGUSR2", exitHandler.bind(null, { exit: true }));

  // catches uncaught exceptions
  process.on("uncaughtException", exitHandler.bind(null, { exit: true }));
}
