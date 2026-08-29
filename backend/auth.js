const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const { findAllowedUser, isAllowed, displayNameFor } = require("./allowed-users");

const IS_PRODUCTION = process.env.NODE_ENV === "production";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";

// How long a sign-in lasts before Google has to vouch for you again.
// Configurable per environment: `fly secrets set SESSION_TTL_HOURS=8`.
const SESSION_TTL_HOURS = Number(process.env.SESSION_TTL_HOURS || 12);

const SESSION_SECRET = process.env.SESSION_SECRET || "thoughtful-local-dev-secret";
const COOKIE_NAME = "thoughtful_session";

// Local development stays frictionless: with no Google client configured we
// run as a fixed local user instead of locking you out of your own laptop.
// Production refuses to boot without real credentials (see assertConfigured).
const AUTH_ENABLED = Boolean(GOOGLE_CLIENT_ID);
const DEV_USER = {
  email: process.env.DEV_USER_EMAIL || "yash@realityshop.io",
  name: "Yash",
};

const googleClient = AUTH_ENABLED ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// Fail loudly at boot rather than silently serving an unauthenticated app
const assertConfigured = () => {
  if (!IS_PRODUCTION) return;
  const missing = [];
  if (!GOOGLE_CLIENT_ID) missing.push("GOOGLE_CLIENT_ID");
  if (!process.env.SESSION_SECRET) missing.push("SESSION_SECRET");
  if (missing.length) {
    throw new Error(
      `Refusing to start in production without: ${missing.join(", ")}. ` +
        `Set them with \`fly secrets set ...\`.`
    );
  }
};

const sessionCookieOptions = () => ({
  httpOnly: true,
  secure: IS_PRODUCTION,
  sameSite: "lax",
  maxAge: SESSION_TTL_HOURS * 60 * 60 * 1000,
  path: "/",
});

const issueSession = (res, user) => {
  const token = jwt.sign(
    { email: user.email, name: user.name },
    SESSION_SECRET,
    { expiresIn: `${SESSION_TTL_HOURS}h` }
  );
  res.cookie(COOKIE_NAME, token, sessionCookieOptions());
};

const clearSession = (res) => {
  res.clearCookie(COOKIE_NAME, { ...sessionCookieOptions(), maxAge: undefined });
};

// Reads the session cookie. Returns null when absent, tampered with, expired,
// or when the person has since been dropped from the allow list.
const readSession = (req) => {
  if (!AUTH_ENABLED) return DEV_USER;
  const token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SESSION_SECRET);
    if (!isAllowed(payload.email)) return null;
    return { email: payload.email, name: displayNameFor(payload.email), exp: payload.exp };
  } catch (error) {
    return null;
  }
};

// Attaches req.user for every request; never rejects on its own
const attachUser = (req, res, next) => {
  req.user = readSession(req);
  next();
};

// Guards the API. Anything not explicitly public needs a live session.
const requireAuth = (req, res, next) => {
  if (req.user) return next();
  res.status(401).json({ error: "Not signed in", code: "UNAUTHENTICATED" });
};

// Exchanges a Google ID token for one of our sessions
const verifyGoogleIdToken = async (idToken) => {
  if (!AUTH_ENABLED) return DEV_USER;
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.email) throw new Error("Google returned no email");
  if (!payload.email_verified) throw new Error("Google email is not verified");

  const allowed = findAllowedUser(payload.email);
  if (!allowed) {
    const err = new Error("This Google account is not on the access list");
    err.code = "NOT_ALLOWED";
    throw err;
  }
  return { email: allowed.email, name: allowed.name, picture: payload.picture };
};

module.exports = {
  AUTH_ENABLED,
  COOKIE_NAME,
  GOOGLE_CLIENT_ID,
  SESSION_TTL_HOURS,
  assertConfigured,
  attachUser,
  requireAuth,
  issueSession,
  clearSession,
  readSession,
  verifyGoogleIdToken,
};
