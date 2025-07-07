import axios from "axios";

export const API = "http://localhost:3001";

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
