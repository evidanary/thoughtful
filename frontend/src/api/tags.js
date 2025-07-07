import axios from "axios";
const API = "http://localhost:3001"; // or use proxy

export const getAllTags = async () => {
  const res = await axios.get(`${API}/tags`);
  return res.data;
};
