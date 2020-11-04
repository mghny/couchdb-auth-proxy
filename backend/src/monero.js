import { attemptP } from "fluture";
import { createWalletWasm, MoneroRpcConnection } from "monero-javascript";

const connection = new MoneroRpcConnection({
  uri: "http://localhost:38081",
  username: "superuser",
  password: "abctesting123",
  rejectUnauthorized: false,
});

export const createWallet = (password) =>
  attemptP(() =>
    createWalletWasm({
      server: connection,
      networkType: "stagenet",
      password,
      language: "English",
    })
  );

export const openWallet = (mnemonic) =>
  attemptP(() =>
    createWalletWasm({
      server: connection,
      networkType: "stagenet",
      password: "password",
      mnemonic,
    })
  );

export const getMnemonic = (wallet) => attemptP(() => wallet.getMnemonic());

export const getPrimaryAddress = (wallet) =>
  attemptP(() => wallet.getPrimaryAddress());
