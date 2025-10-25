
export const storage = {
  getToken: () => {
    return localStorage.getItem("auth_token");
  },
  setToken: (token: string) => {
    localStorage.setItem("auth_token", token);
  },
  clearToken: () => {
    localStorage.removeItem("auth_token");
  },
};
