import axios from "axios";
import { API } from "./contacts";

export const searchAll = async (q) => {
  const res = await axios.get(`${API}/search`, { params: { q } });
  return res.data;
};
