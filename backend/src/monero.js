import { attemptP } from "fluture";
import { createWalletWasm, MoneroRpcConnection } from "monero-javascript";

const connection = new MoneroRpcConnection({
  uri: "http://localhost:38081",
  username: "superuser",
  password: "abctesting123",
  rejectUnauthorized: false,
});

export const createWallet = ({ password, language = "English" }) =>
  attemptP(() =>
    createWalletWasm({
      server: connection,
      networkType: "stagenet",
      password,
      language,
    })
  );

export const openWallet = ({ mnemonic, password }) =>
  attemptP(() =>
    createWalletWasm({
      server: connection,
      networkType: "stagenet",
      password,
      mnemonic,
    })
  );

export const getMnemonic = (wallet) => attemptP(() => wallet.getMnemonic());

export const getPrimaryAddress = (wallet) =>
  attemptP(() => wallet.getPrimaryAddress());
