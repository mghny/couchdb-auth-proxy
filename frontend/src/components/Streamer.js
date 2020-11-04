import { useRecoilState } from "recoil";

import { userState } from "../store";

// poor mans uid implementation
const uid = () => Math.random().toString(36).substring(2, 15);

export default function User() {
  const [user, setUser] = useRecoilState(userState);

  console.log(user);

  function onClick() {
    setUser((oldUser) => ({
      ...oldUser,
      [uid()]: uid(),
    }));
  }

  return (
    <div>
      <h2>User</h2>
      <button onClick={onClick}>Update User</button>
    </div>
  );
}
