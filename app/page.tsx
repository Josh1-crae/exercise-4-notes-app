"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      setError("Please use a valid @gmail.com email address.");
      return;
    }

    if (password.length <= 6) {
      setError("Your password must be more than 6 characters.");
      return;
    }

    window.localStorage.setItem("exercise4-user", email.trim());
    setError("");
    router.push("/notes");
  }

  return (
    <main className="login-page">
      <div className="login-layout">
        <section className="welcome-panel" aria-label="Welcome">
          <Link className="brand" href="/" aria-label="Noted home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M7 3.75h8l4.25 4.5v11A1.75 1.75 0 0 1 17.5 21h-10A1.75 1.75 0 0 1 5.75 19.25v-13A2.5 2.5 0 0 1 8.25 3.75Z" />
                <path d="M14.75 4v4.5h4.1M9 12h7M9 15.5h7" />
              </svg>
            </span>
            <span>noted<span className="brand-period">.</span></span>
          </Link>

          <div className="welcome-copy">
            <span className="welcome-kicker">A little space for your thoughts</span>
            <h1>Make room for the ideas that matter.</h1>
            <p>
              Keep your notes, plans, and sparks of inspiration together in one
              calm place.
            </p>
            <div className="welcome-decoration" aria-hidden="true">
              <span className="decoration-line" />
              <span className="decoration-dot decoration-dot-one" />
              <span className="decoration-dot decoration-dot-two" />
              <span className="decoration-card">
                <span className="decoration-card-line" />
                <span className="decoration-card-line short" />
                <span className="decoration-card-line" />
              </span>
            </div>
          </div>

          <p className="welcome-footer">Your mind, a little more organized.</p>
        </section>

        <section className="form-panel" aria-labelledby="login-heading">
          <div className="form-content">
            <span className="form-eyebrow">WELCOME BACK</span>
            <h2 id="login-heading">Sign in to Noted</h2>
            <p className="form-intro">Pick up right where your thoughts left off.</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="input-group">
                <label htmlFor="email">Email address</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2.5" />
                    <path d="m4.5 7 7.5 5.75L19.5 7" />
                  </svg>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "login-error" : undefined}
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="4.5" y="10" width="15" height="11" rx="2.5" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v3" />
                  </svg>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    autoComplete="current-password"
                    placeholder="At least 7 characters"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError("");
                    }}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? "login-error" : "password-hint"}
                  />
                </div>
                <span className="input-hint" id="password-hint">
                  Use more than 6 characters.
                </span>
              </div>

              <button className="submit-button" type="submit">
                Sign in <span aria-hidden="true">→</span>
              </button>
              <div className="form-message" aria-live="polite">
                {error && (
                  <p className="form-error" id="login-error">
                    <span aria-hidden="true">!</span> {error}
                  </p>
                )}
              </div>
            </form>

            <div className="form-note">
              <span className="note-sparkle" aria-hidden="true">✳</span>
              A simple place to collect what’s on your mind.
            </div>
          </div>
          <p className="copyright">EXERCISE 04 <span>·</span> NOTES APP</p>
        </section>
      </div>
    </main>
  );
}
