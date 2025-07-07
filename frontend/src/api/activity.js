import axios from "axios";
import { API } from "./contacts";

export const getActivity = async (query = "") => {
  const res = await axios.get(`${API}/activity${query}`);
  return res.data;
};
