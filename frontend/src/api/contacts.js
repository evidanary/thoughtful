import axios from "axios";

// In production the API and the UI share an origin (Express serves the built
// React app), so an empty base URL is correct. Locally CRA runs on :3000 while
// the backend stays on :3002.
export const API =
  process.env.REACT_APP_API_URL !== undefined
    ? process.env.REACT_APP_API_URL
    : window.location.port === "3000"
    ? "http://localhost:3002"
    : "";

// The session lives in an HttpOnly cookie, so every request must carry it
axios.defaults.withCredentials = true;

// A dead or expired session should bounce the whole app back to sign-in rather
// than surfacing as a random failure inside whichever page made the call.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";
    if (status === 401 && !url.includes("/auth/")) {
      window.dispatchEvent(new CustomEvent("thoughtful:signed-out"));
    }
    return Promise.reject(error);
  }
);

export const getContact = async (id) => {
  const res = await axios.get(`${API}/contacts/${id}`);
  return res.data;
};

export const addNote = async (contactId, content) => {
  const res = await axios.post(`${API}/contacts/${contactId}/note`, {
    content,
  });
  return res.data;
};

export const addTag = async (contactId, name) => {
  const res = await axios.post(`${API}/contacts/${contactId}/tag`, { name });
  return res.data;
};

export const updateContact = async (contactId, contactData) => {
  const res = await axios.put(`${API}/contacts/${contactId}`, contactData);
  return res.data;
};

export const deleteTag = async (contactId, tagName) => {
  const res = await axios.delete(
    `${API}/contacts/${contactId}/tags/${encodeURIComponent(tagName)}`
  );
  return res.data;
};

export const updateNote = async (contactId, noteId, content) => {
  const res = await axios.put(`${API}/contacts/${contactId}/notes/${noteId}`, {
    content,
  });
  return res.data;
};

export const deleteNote = async (contactId, noteId) => {
  const res = await axios.delete(
    `${API}/contacts/${contactId}/notes/${noteId}`
  );
  return res.data;
};

export const getAllContacts = async (query = "") => {
  const res = await axios.get(`${API}/contacts${query}`);
  return res.data;
};

export const addContact = async (contactData) => {
  const res = await axios.post(`${API}/contacts`, contactData);
  return res.data;
};

export const deleteContact = async (contactId) => {
  console.log("deleteContact API call - contactId:", contactId);
  console.log("deleteContact API call - URL:", `${API}/contacts/${contactId}`);
  const res = await axios.delete(`${API}/contacts/${contactId}`);
  console.log("deleteContact API call - response:", res);
  return res.data;
};
