const store = {
  token: "",
};

export const setToken = (token) => {
  store.token = token;
};

export const getToken = () => {
  return store.token;
};
