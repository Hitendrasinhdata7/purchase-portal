import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [username, setUsername] = useState("manager@store.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(username, password);
      setUser(user);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-appbg px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-lg bg-primary text-white flex items-center justify-center font-extrabold text-2xl shadow-lg shadow-primary/30">
            P
          </div>
          <h1 className="mt-4 text-xl font-extrabold text-slate-900">Purchase Portal</h1>
          <p className="text-sm text-slate-500">Admin Panel</p>
        </div>
        <form onSubmit={submit} className="card flex flex-col gap-4">
          {error && <div className="bg-danger-bg text-danger text-sm rounded-md px-3 py-2">{error}</div>}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-2">
            {loading ? "Signing in..." : "Sign in"}
          </button>
          <p className="text-xs text-slate-400 text-center">
            Demo: manager@store.com / 123456 · admin@store.com / 123456
          </p>
        </form>
      </div>
    </div>
  );
}
