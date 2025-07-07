import axios from "axios";

import { API } from "./contacts";

export const getAllViews = async () => {
  const res = await axios.get(`${API}/views`);
  return res.data;
};
