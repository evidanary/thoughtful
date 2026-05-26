import axios from "axios";
const API = "http://localhost:3001";

export const searchAll = async (q) => {
  const res = await axios.get(`${API}/search`, { params: { q } });
  return res.data;
};
