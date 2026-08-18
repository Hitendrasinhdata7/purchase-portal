import { useEffect, useState } from "react";
import { AuthContext } from "./hooks/useAuth";
import { ToastProvider } from "./components/Toast";
import { getStoredUser, fetchMe } from "./services/auth";
import type { User } from "./types";
import AppRoutes from "./routes";

export default function App() {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchMe()
        .then(setUser)
        .catch(() => setUser(null))
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  if (!ready) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated: !!user }}>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthContext.Provider>
  );
}
