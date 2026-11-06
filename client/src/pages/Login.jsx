import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);

 

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/reels", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.identifier.trim() || !form.password.trim()) {
      setError("Please enter username/email and password.");
      return;
    }

    try {
      setButtonLoading(true);
      const data = await login(form);

      if (data.accessToken) {
        navigate("/reels", { replace: true });
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(message);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading || isAuthenticated) {
    return null;
  }

  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gray-900 text-slate-100 font-sans antialiased overflow-hidden relative select-none">
      {/* Decorative background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-linear-to-tr from-cyan-500 to-blue-600 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

      <div className="w-full max-w-sm p-8 bg-zinc-900/60 backdrop-blur-xl border border-zinc-800/80 rounded-3xl shadow-2xl mx-4 z-10">
        {/* App Logo / Heading */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-linear-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-1.5">
            ReelNet
          </h2>
          <p className="text-sm text-zinc-400">
            Welcome back! Ready to dive in?
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="identifier"
              className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
            >
              Username or Email
            </label>
            <input
              id="identifier"
              type="text"
              name="identifier"
              value={form.identifier}
              onChange={handleChange}
              placeholder="@username or email"
              className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 shadow-inner outline-none transition duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-zinc-400"
              >
                Password
              </label>
              <Link
                to="#"
                className="text-xs text-cyan-400 hover:text-cyan-300 transition"
              >
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 shadow-inner outline-none transition duration-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={buttonLoading}
            className="w-full mt-2 bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-cyan-500/10 transition-all duration-200 transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {buttonLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-zinc-500 mt-8">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-zinc-300 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
