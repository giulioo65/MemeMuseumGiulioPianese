import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

// Legge i dati salvati dal localStorage al primo caricamento (lazy initializer)
function readToken()    { return localStorage.getItem("token") || null; }
function readUser()     {
  try { return JSON.parse(localStorage.getItem("user")) || null; }
  catch { return null; }
}

export function AuthProvider({ children }) {
  const [token,      setToken]      = useState(readToken);
  const [user,       setUser]       = useState(readUser);
  // token e user vengono letti in modo sincrono con lazy initializer,
  // quindi authLoaded è subito true (nessun effetto asincrono necessario)
  const [authLoaded] = useState(true);

  function login(authData) {
    localStorage.setItem("token", authData.token);
    localStorage.setItem("user", JSON.stringify(authData.user));
    setToken(authData.token);
    setUser(authData.user);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isAuthenticated,
        authLoaded,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}