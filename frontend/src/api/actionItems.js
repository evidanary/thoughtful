import axios from "axios";
import { API } from "./contacts"; // Reuse the same API base URL

export const getAllActionItems = async () => {
  const res = await axios.get(`${API}/action-items`);
  return res.data;
};
