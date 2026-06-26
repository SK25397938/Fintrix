"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../components/AuthProvider";
import { useTheme } from "../../components/ThemeProvider";

function normalizeEmail(value) {
  return value.trim().toLowerCase();
}

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 3l18 18" />
      <path d="M10.6 6.3A9.7 9.7 0 0 1 12 6c5.5 0 9 6 9 6a16.6 16.6 0 0 1-3.2 3.8" />
      <path d="M6.6 6.7C4.4 8.2 3 10.5 3 12c0 0 3.5 6 9 6 1.5 0 2.9-.4 4.1-1" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.3-1.6 3.8-5.4 3.8-3.2 0-5.9-2.7-5.9-5.9s2.7-5.9 5.9-5.9c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.6 12 2.6A9.4 9.4 0 0 0 2.6 12 9.4 9.4 0 0 0 12 21.4c5.4 0 8.9-3.8 8.9-9.1 0-.6-.1-1.1-.1-1.6H12Z" />
      <path fill="#34A853" d="M2.6 7.6 5.8 10c.9-2.3 3.2-3.9 6.2-3.9 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.5 14.6 2.6 12 2.6c-3.7 0-6.9 2.1-8.4 5Z" />
      <path fill="#FBBC05" d="M12 21.4c2.5 0 4.6-.8 6.1-2.3l-2.8-2.3c-.8.5-1.9.9-3.3.9-3.7 0-5.1-2.5-5.4-3.8l-3.2 2.4c1.5 3 4.6 5.1 8.6 5.1Z" />
      <path fill="#4285F4" d="M21 12.3c0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.3-1.1 2.3-2.1 3l2.8 2.3c1.6-1.5 2.9-3.8 2.9-7.6Z" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isReady, login } = useAuth();
  const { darkMode } = useTheme();
  const [mode, setMode] = useState("create");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, isReady, router]);

  useEffect(() => {
    // No local autofill when using backend auth.
  }, []);

  const isCreateValid = useMemo(
    () =>
      Boolean(
        email.trim() &&
          /\S+@\S+\.\S+/.test(email) &&
          password.trim().length >= 6
      ),
    [email, password]
  );

  const isLoginValid = useMemo(
    () => Boolean(email.trim() && /\S+@\S+\.\S+/.test(email) && password.trim()),
    [email, password]
  );

  function resetMessages() {
    setError("");
    setNotice("");
  }

  function handleEmailChange(event) {
    setEmail(event.target.value);
    if (error || notice) {
      resetMessages();
    }
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    if (error || notice) {
      resetMessages();
    }
  }

  async function handleCreateAccount(event) {
    event.preventDefault();
    if (!isCreateValid) {
      setError("Enter a valid email address and a password with at least 6 characters.");
      return;
    }

    try {
      const response = await fetch(`/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(email),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.detail || "Unable to create account right now.");
        return;
      }

      const data = await response.json();
      const nextUser = {
        email: data?.user?.email || normalizeEmail(email),
      };

      login(nextUser, data.token);
      router.replace("/");
    } catch {
      setError("Unable to connect to the signup service.");
    }
  }

  async function handleLogin(event) {
    event.preventDefault();
    if (!isLoginValid) {
      setError("Enter the email and password you used when creating your account.");
      return;
    }

    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizeEmail(email),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const detail = String(data?.detail || "").toLowerCase();
        if (detail.includes("invalid credential")) {
          setError("Invalid email or password.");
        } else {
          setError(data?.detail || "Invalid email or password.");
        }
        return;
      }

      const data = await response.json();
      const nextUser = {
        email: data?.user?.email || normalizeEmail(email),
      };

      login(nextUser, data.token);
      router.replace("/");
    } catch {
      setError("Unable to connect to the login service.");
    }
  }

  function handleGoogleClick() {
    setNotice("Google sign-in is not connected yet. Use the form to create or log into your local account.");
    setError("");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_18%_8%,rgba(29,112,191,0.34)_0%,rgba(10,62,116,0.28)_30%,rgba(5,37,78,1)_72%),linear-gradient(145deg,#04244b_0%,#052f5f_42%,#0a3f78_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:px-5 lg:py-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,rgba(255,255,255,0.06),transparent_24%),radial-gradient(circle_at_78%_48%,rgba(255,255,255,0.04),transparent_22%)]" />
      <div className="relative mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-6xl flex-col">
        <div className="flex items-center">
          <Link href="/" className="transition-opacity duration-300 hover:opacity-85">
            <img
              src="/fintrix-logo-white.png"
              alt="FinTrix"
              className="h-12 w-auto object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] sm:h-14 md:h-16"
            />
          </Link>
        </div>

        <div className="flex flex-1 items-start justify-center pt-6 sm:items-center sm:pt-0">
          <div
            className={`w-full max-w-[510px] rounded-[30px] border p-5 shadow-[0_30px_70px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10 ${
              darkMode
                ? "border-white/18 bg-fintrix-dark/82 text-white"
                : "border-fintrix-dark/20 bg-white/90 text-fintrix-ink"
            }`}
          >
            <h1 className={`text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-[56px] ${darkMode ? "text-white" : "text-fintrix-ink"}`}>
              {mode === "create" ? "Create an account" : "Log in"}
            </h1>

            <p className={`mt-5 text-sm sm:text-base ${darkMode ? "text-white/65" : "text-fintrix-muted"}`}>
              {mode === "create" ? "Already have an account? " : "Need a new account? "}
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode((current) => (current === "create" ? "login" : "create"));
                }}
                className={`font-semibold underline underline-offset-4 ${darkMode ? "text-fintrix-accent" : "text-[#0a4f95]"}`}
              >
                {mode === "create" ? "Log in" : "Create one"}
              </button>
            </p>

            <form onSubmit={mode === "create" ? handleCreateAccount : handleLogin} className="mt-8 space-y-4 sm:mt-10 sm:space-y-5">

              <input
                autoComplete="email"
                value={email}
                onChange={handleEmailChange}
                placeholder="Email"
                className={`w-full rounded-2xl border px-5 py-4 text-base outline-none focus:border-fintrix-accent focus:ring-2 focus:ring-fintrix-accent/30 ${
                  darkMode
                    ? "border-white/30 bg-fintrix-dark/70 text-white placeholder:text-white/40"
                    : "border-fintrix-dark/15 bg-white text-fintrix-ink placeholder:text-fintrix-muted/55"
                }`}
              />

              <div
                className={`flex items-center rounded-2xl border px-5 py-4 focus-within:border-fintrix-accent focus-within:ring-2 focus-within:ring-fintrix-accent/30 ${
                  darkMode ? "border-white/30 bg-fintrix-dark/70" : "border-fintrix-dark/15 bg-white"
                }`}
              >
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "create" ? "new-password" : "current-password"}
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder={mode === "create" ? "Create your password" : "Enter your password"}
                  className={`w-full appearance-none bg-transparent text-base outline-none ${
                    darkMode ? "text-white placeholder:text-white/40" : "text-fintrix-ink placeholder:text-fintrix-muted/70"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className={`ml-4 transition-colors duration-300 ${darkMode ? "text-white/45 hover:text-white/75" : "text-fintrix-muted hover:text-fintrix-ink"}`}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>

              {error ? <p className={`text-sm ${darkMode ? "text-[#ffd4d4]" : "text-red-600"}`}>{error}</p> : null}
              {notice ? <p className={`text-sm ${darkMode ? "text-white/75" : "text-fintrix-muted"}`}>{notice}</p> : null}

              <button
                type="submit"
                className="w-full rounded-2xl bg-fintrix-dark px-5 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(5,47,95,0.32)] transition-all duration-300 hover:bg-[#0b4a8c] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={mode === "create" ? !isCreateValid : !isLoginValid}
              >
                {mode === "create" ? "Create account" : "Log in"}
              </button>
            </form>

            <div className={`mt-8 flex items-center gap-4 text-sm ${darkMode ? "text-white/40" : "text-fintrix-muted"}`}>
              <div className={`h-px flex-1 ${darkMode ? "bg-white/10" : "bg-fintrix-dark/10"}`} />
              <span>{mode === "create" ? "Or register with" : "Or continue with"}</span>
              <div className={`h-px flex-1 ${darkMode ? "bg-white/10" : "bg-fintrix-dark/10"}`} />
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleClick}
                className={`inline-flex w-full items-center justify-center gap-3 rounded-2xl border px-5 py-4 text-base font-semibold transition-all duration-300 ${
                  darkMode
                    ? "border-white/18 bg-transparent text-white hover:bg-white/6"
                    : "border-fintrix-dark/20 bg-white text-fintrix-ink hover:bg-[#f4fffe]"
                }`}
              >
                <GoogleIcon />
                Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
