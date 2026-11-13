import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ApiError } from "../api/client";
import { useLogin, useSession } from "../hooks/useSession";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { data: admin } = useSession();
  const signIn = useLogin();

  // Where to send the user after a successful login. If RequireAdmin
  // bounced them here, location.state.from holds the original target;
  // otherwise default to the dashboard.
  const from = (location.state as { from?: string } | null)?.from ?? "/admin";

  // If you're already signed in, don't show the login form — bounce.
  // A successful sign-in lands here too: useLogin refetches the session.
  useEffect(() => {
    if (admin) {
      navigate(from, { replace: true });
    }
  }, [admin, from, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn.mutateAsync({ email, password });
    } catch (err) {
      setError(
        err instanceof ApiError && err.status !== 0
          ? err.message
          : "Unable to connect. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-5">
      <div className="w-full max-w-[360px]">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-muted text-sm hover:text-ink transition-colors mb-10"
        >
          ← Back
        </a>

        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <img
            src="/assets/justme.jpg"
            alt="Rowan Stratton"
            className="w-14 h-[70px] object-cover rounded-[50%] border border-rule"
          />
        </div>

        <h1 className="text-ink text-xl font-medium tracking-tight text-center mb-1">
          Admin
        </h1>
        <p className="text-faint text-sm text-center mb-8">
          Sign in to manage your portfolio
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-body text-xs mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-rule rounded-lg text-sm text-ink placeholder-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-body text-xs mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-rule rounded-lg text-sm text-ink placeholder-faint focus:outline-none focus:border-accent transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={signIn.isPending}
            className={cn(buttonVariants({ size: "lg" }), "w-full")}
          >
            {signIn.isPending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
