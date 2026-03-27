import axios from "axios";
import { API } from "./contacts";

export const getQuickNotes = async () => {
  const res = await axios.get(`${API}/quick-notes`);
  return res.data;
};

export const createQuickNote = async (content) => {
  const res = await axios.post(`${API}/quick-notes`, { content });
  return res.data;
};

export const associateQuickNote = async (noteId, contactId) => {
  const res = await axios.put(`${API}/quick-notes/${noteId}/associate`, { contact_id: contactId });
  return res.data;
};

export const deleteQuickNote = async (noteId) => {
  const res = await axios.delete(`${API}/quick-notes/${noteId}`);
  return res.data;
};
