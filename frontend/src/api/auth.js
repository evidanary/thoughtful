import axios from "axios";
import { API } from "./contacts";

// Public: tells the UI whether Google sign-in is switched on and which client
// id to use. Safe to call while signed out.
export const getAuthConfig = async () => {
  const res = await axios.get(`${API}/auth/config`);
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await axios.get(`${API}/auth/me`);
  return res.data;
};

// Exchanges the Google ID token for a Thoughtful session cookie
export const signInWithGoogle = async (credential) => {
  const res = await axios.post(`${API}/auth/google`, { credential });
  return res.data;
};

export const signOut = async () => {
  const res = await axios.post(`${API}/auth/logout`);
  return res.data;
};

// "yash@realityshop.io" -> "Yash". Keeps attribution readable without needing
// to ship the access list to the browser.
export const displayName = (email) => {
  if (!email) return "Unknown";
  const local = String(email).split("@")[0];
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};
