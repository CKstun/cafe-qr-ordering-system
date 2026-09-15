import { useState } from "react";
import logo from "../../../assets/logo.jpg";
import { apiPost } from "./adminApi";

function Login({ onLoggedIn, statusMessage = "" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const user = await apiPost("auth.php", {
        username: username.trim(),
        password,
      });

      onLoggedIn(user);
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7eee1] px-6">
      <div className="w-full max-w-md rounded-3xl border border-[#ead9c3] bg-[#fffdf8] p-9 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <img
            src={logo}
            alt="Café Pepita"
            className="h-20 w-20 rounded-full object-cover shadow-sm"
          />
          <h1 className="mt-4 text-2xl font-extrabold text-[#46281b]">Welcome back</h1>
          <p className="mt-1 text-sm text-[#8a7863]">Sign in to your Café Pepita admin account</p>
        </div>

        {statusMessage && <div role="status" className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"><span aria-hidden="true">✓</span>{statusMessage}</div>}

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
              USERNAME
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
              placeholder="admin"
              className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-4 py-2.5 text-sm outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold tracking-wide text-[#9c8873]">
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl border border-[#e6d8c3] bg-white px-4 py-2.5 text-sm outline-none"
            />
          </div>

          {error && (
            <div role="alert" className="flex items-start gap-3 rounded-xl border-2 border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800 shadow-sm"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">!</span><span>{error}</span></div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#5a3e32] py-3 text-sm font-semibold text-white hover:bg-[#46281b] disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
