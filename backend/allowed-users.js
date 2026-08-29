/**
 * Who is allowed into Thoughtful.
 *
 * This is the hard-coded access list — add or remove people here and redeploy.
 * Only Google accounts whose verified email appears below can sign in; everyone
 * else is rejected after Google authenticates them.
 *
 * `name` is only used for display ("Added by Yash"), so keep it short.
 */
const ALLOWED_USERS = [
  { email: "yash@realityshop.io", name: "Yash" },
  { email: "xavier@videoselz.com", name: "Xavier" },
];

const normalize = (email) => String(email || "").trim().toLowerCase();

const findAllowedUser = (email) => {
  const target = normalize(email);
  return ALLOWED_USERS.find((user) => normalize(user.email) === target) || null;
};

const isAllowed = (email) => Boolean(findAllowedUser(email));

// "yash@realityshop.io" -> "Yash"; falls back to the local part for anyone
// whose row was removed after they had already written something.
const displayNameFor = (email) => {
  const user = findAllowedUser(email);
  if (user) return user.name;
  if (!email) return "Unknown";
  return String(email).split("@")[0];
};

module.exports = { ALLOWED_USERS, findAllowedUser, isAllowed, displayNameFor };
