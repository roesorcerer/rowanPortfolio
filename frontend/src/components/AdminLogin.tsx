import { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed");
      } else {
        localStorage.setItem("token", data.data.token);
        navigate("/admin");
      }
    } catch {
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F7] flex items-center justify-center px-5">
      <div className="w-full max-w-[360px]">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[#888780] text-sm hover:text-[#2C2C2A] transition-colors mb-10"
        >
          ← Back
        </a>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <img
            src="/assets/justme.jpg"
            alt="Rowan Stratton"
            className="w-14 h-[70px] object-cover rounded-[50%] border border-[#E8E6E1]"
          />
        </div>

        <h1 className="text-[#2C2C2A] text-xl font-medium tracking-tight text-center mb-1">
          Admin
        </h1>
        <p className="text-[#B4B2A9] text-sm text-center mb-8">
          Sign in to manage your portfolio
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-[#5F5E5A] text-xs mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#1D9E75] transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[#5F5E5A] text-xs mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-[#E8E6E1] rounded-lg text-sm text-[#2C2C2A] placeholder-[#B4B2A9] focus:outline-none focus:border-[#1D9E75] transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#2C2C2A] text-[#FAF9F7] text-sm rounded-lg hover:bg-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
