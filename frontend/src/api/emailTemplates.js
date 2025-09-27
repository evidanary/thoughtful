import axios from "axios";

export const API = "http://localhost:3001";

export const getAllEmailTemplates = async () => {
  const res = await axios.get(`${API}/email-templates`);
  return res.data;
};

export const createEmailTemplate = async (templateData) => {
  const res = await axios.post(`${API}/email-templates`, templateData);
  return res.data;
};

export const updateEmailTemplate = async (templateId, templateData) => {
  const res = await axios.put(`${API}/email-templates/${templateId}`, templateData);
  return res.data;
};

export const deleteEmailTemplate = async (templateId) => {
  const res = await axios.delete(`${API}/email-templates/${templateId}`);
  return res.data;
};
