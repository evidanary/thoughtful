import axios from "axios";
const API = "http://localhost:3001";

export const getAllTags = async () => {
  const res = await axios.get(`${API}/tags`);
  return res.data;
};

export const getTagDefinitions = async () => {
  const res = await axios.get(`${API}/tag-definitions`);
  return res.data;
};

export const createTagDefinition = async (name, description) => {
  const res = await axios.post(`${API}/tag-definitions`, { name, description });
  return res.data;
};

export const updateTagDefinition = async (id, name, description) => {
  const res = await axios.put(`${API}/tag-definitions/${id}`, { name, description });
  return res.data;
};

export const deleteTagDefinition = async (id) => {
  const res = await axios.delete(`${API}/tag-definitions/${id}`);
  return res.data;
};
