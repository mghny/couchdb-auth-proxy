import { Fragment, useState } from "react";

import Configuration from "./components/Configuration";
import Streamer from "./components/Streamer";

import { useSocket } from "./socket";
import { setToken } from "./token";

// ea2a40e3c85c1aefa36fcdb8fe2caf5c82cf0c30d126f261ce88e4149874201a

function App() {
  const { socket } = useSocket();
  const [isOk, setIsOk] = useState(false);
  const [seed, setSeed] = useState("");

  function onChange(event) {
    setSeed(event.target.value);
  }

  function onSubmit(event) {
    event.preventDefault();

    socket.emit("login", { seed }, ({ ok, token, error }) => {
      if (ok) {
        setToken(token);
      } else {
        console.error(error);
      }

      setIsOk(ok);
    });
  }

  if (isOk) {
    return (
      <Fragment>
        <h1>Dashboard</h1>
        <Streamer />
        <Configuration />
      </Fragment>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h2>Login</h2>
      <form style={{ width: "12em" }} onSubmit={onSubmit}>
        <input style={{ width: "100%" }} value={seed} onChange={onChange} />
        <br />
        <button style={{ width: "100%" }} type="submit">
          Submit
        </button>
      </form>
    </div>
  );
}

export default App;
