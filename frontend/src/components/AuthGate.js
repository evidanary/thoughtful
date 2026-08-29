import { useCallback, useEffect, useRef, useState } from "react";
import {
  getAuthConfig,
  getCurrentUser,
  signInWithGoogle,
} from "../api/auth";

const GSI_SRC = "https://accounts.google.com/gsi/client";

const loadGoogleScript = () =>
  new Promise((resolve, reject) => {
    if (window.google && window.google.accounts) return resolve();
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const el = document.createElement("script");
    el.src = GSI_SRC;
    el.async = true;
    el.defer = true;
    el.onload = resolve;
    el.onerror = () => reject(new Error("Could not reach Google sign-in"));
    document.head.appendChild(el);
  });

/**
 * Wraps the whole app. Nothing renders until Google has vouched for someone on
 * the access list. Sessions are time-limited server-side (SESSION_TTL_HOURS),
 * so people are asked to sign in again periodically; a 401 from any API call
 * drops straight back to this screen.
 */
const AuthGate = ({ children }) => {
  const [config, setConfig] = useState(null);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);
  const buttonRef = useRef(null);

  const checkSession = useCallback(async () => {
    try {
      setUser(await getCurrentUser());
    } catch (err) {
      setUser(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    getAuthConfig()
      .then((cfg) => {
        setConfig(cfg);
        return checkSession();
      })
      .catch(() => {
        setError("Cannot reach the Thoughtful server.");
        setChecking(false);
      });
  }, [checkSession]);

  // Any expired session anywhere in the app lands back here
  useEffect(() => {
    const handleSignedOut = () => setUser(null);
    window.addEventListener("thoughtful:signed-out", handleSignedOut);
    return () =>
      window.removeEventListener("thoughtful:signed-out", handleSignedOut);
  }, []);

  const handleCredential = useCallback(async (response) => {
    setError(null);
    try {
      await signInWithGoogle(response.credential);
      const me = await getCurrentUser();
      setUser(me);
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Sign-in failed. Try again, or check you are using the right Google account."
      );
    }
  }, []);

  // Render Google's own button once we know we need one
  useEffect(() => {
    if (!config || !config.authEnabled || user || checking) return;
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current) return;
        window.google.accounts.id.initialize({
          client_id: config.googleClientId,
          callback: handleCredential,
        });
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "pill",
        });
      })
      .catch(() => setError("Could not load Google sign-in."));
    return () => {
      cancelled = true;
    };
  }, [config, user, checking, handleCredential]);

  if (checking) return <Splash>Loading…</Splash>;

  // Auth switched off (local dev with no Google client): the server hands back
  // a fixed user from /auth/me, so this screen should never be reached.
  if (config && !config.authEnabled && !user) {
    return <Splash>Local dev mode — no session. Is the backend running?</Splash>;
  }

  if (user) return children;

  return (
    <Splash>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: 34,
            fontWeight: "bold",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            background: "linear-gradient(90deg, #4B0082, #FFB6C1, #00BFFF)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Thoughtful
        </h1>
        <p style={{ color: "#666", fontSize: 14, margin: "0 0 24px" }}>
          Sign in with the Google account that has access.
        </p>

        <div
          ref={buttonRef}
          style={{ display: "flex", justifyContent: "center" }}
        />

        {error && (
          <p style={{ color: "#c00", fontSize: 13, marginTop: 18 }}>{error}</p>
        )}

        {config && config.sessionTtlHours && (
          <p style={{ color: "#aaa", fontSize: 11, marginTop: 24 }}>
            Sessions last {config.sessionTtlHours} hours before you are asked
            again.
          </p>
        )}
      </div>
    </Splash>
  );
};

const Splash = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8f9fa",
      padding: 24,
    }}
  >
    {children}
  </div>
);

export default AuthGate;
