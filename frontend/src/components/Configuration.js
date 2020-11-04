import { useRecoilState } from "recoil";

import { configurationState } from "../store";

// poor mans uid implementation
const uid = () => Math.random().toString(36).substring(2, 15);

export default function Configuration() {
  const [configuration, setConfiguration] = useRecoilState(configurationState);

  console.log(configuration);

  function onClick() {
    setConfiguration((oldConfiguration) => ({
      ...oldConfiguration,
      [uid()]: uid(),
    }));
  }

  return (
    <div>
      <h2>Configuration</h2>
      <button onClick={onClick}>Update Configuration</button>
    </div>
  );
}
