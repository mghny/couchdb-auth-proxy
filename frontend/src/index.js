import { StrictMode } from "react";
import { render } from "react-dom";
import { RecoilRoot } from "recoil";
import "./index.css";
import App from "./App";

import { SocketProvider } from "./socket";

const container = document.getElementById("root");

render(
  <StrictMode>
    <RecoilRoot>
      <SocketProvider>
        <App />
      </SocketProvider>
    </RecoilRoot>
  </StrictMode>,
  container
);
