import axios from "axios";

import { API } from "./contacts";

export const getAllViews = async () => {
  const res = await axios.get(`${API}/views`);
  return res.data;
};

export const createView = async (viewData) => {
  const res = await axios.post(`${API}/views`, viewData);
  return res.data;
};
