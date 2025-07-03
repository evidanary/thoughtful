import axios from "axios";

const API = "http://localhost:3001";

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
