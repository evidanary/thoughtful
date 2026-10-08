import axios from "axios";
import { API } from "./contacts";

export const getAllTags = async () => {
  const res = await axios.get(`${API}/tags`);
  return res.data;
};

export const getTagDefinitions = async () => {
  const res = await axios.get(`${API}/tag-definitions`);
  return res.data;
};

// fields: { name, description, is_council, council_target }
export const createTagDefinition = async (fields) => {
  const res = await axios.post(`${API}/tag-definitions`, fields);
  return res.data;
};

export const updateTagDefinition = async (id, fields) => {
  const res = await axios.put(`${API}/tag-definitions/${id}`, fields);
  return res.data;
};

export const deleteTagDefinition = async (id) => {
  const res = await axios.delete(`${API}/tag-definitions/${id}`);
  return res.data;
};

// Council tags with their members: [{ id, name, description, council_target, members: [{ id, name, company }] }]
export const getCouncils = async () => {
  const res = await axios.get(`${API}/councils`);
  return res.data;
};
