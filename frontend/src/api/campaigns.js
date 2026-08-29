import axios from "axios";
import { API } from "./contacts";

// --- Campaigns ---

export const getAllCampaigns = async (query = "") => {
  const res = await axios.get(`${API}/campaigns${query}`);
  return res.data;
};

export const getCampaign = async (id) => {
  const res = await axios.get(`${API}/campaigns/${id}`);
  return res.data;
};

export const createCampaign = async (campaignData) => {
  const res = await axios.post(`${API}/campaigns`, campaignData);
  return res.data;
};

export const updateCampaign = async (id, campaignData) => {
  const res = await axios.put(`${API}/campaigns/${id}`, campaignData);
  return res.data;
};

export const deleteCampaign = async (id) => {
  const res = await axios.delete(`${API}/campaigns/${id}`);
  return res.data;
};

// Roll-up across several campaigns at once
export const getCombinedCampaigns = async (ids) => {
  const res = await axios.get(`${API}/campaigns/combined?ids=${ids.join(",")}`);
  return res.data;
};

// --- Stages ---

export const addCampaignStage = async (campaignId, stage) => {
  const res = await axios.post(`${API}/campaigns/${campaignId}/stages`, stage);
  return res.data;
};

// Replaces the campaign's whole stage list; stages with an id keep their contacts
export const saveCampaignStages = async (campaignId, stages) => {
  const res = await axios.put(`${API}/campaigns/${campaignId}/stages`, {
    stages,
  });
  return res.data;
};

export const deleteCampaignStage = async (campaignId, stageId) => {
  const res = await axios.delete(
    `${API}/campaigns/${campaignId}/stages/${stageId}`
  );
  return res.data;
};

// --- Membership ---

export const addContactsToCampaign = async (campaignId, contactIds, stageId) => {
  const res = await axios.post(`${API}/campaigns/${campaignId}/contacts`, {
    contact_ids: contactIds,
    stage_id: stageId,
  });
  return res.data;
};

export const updateCampaignContact = async (campaignId, contactId, data) => {
  const res = await axios.put(
    `${API}/campaigns/${campaignId}/contacts/${contactId}`,
    data
  );
  return res.data;
};

export const removeContactFromCampaign = async (campaignId, contactId) => {
  const res = await axios.delete(
    `${API}/campaigns/${campaignId}/contacts/${contactId}`
  );
  return res.data;
};

export const getContactCampaigns = async (contactId) => {
  const res = await axios.get(`${API}/contacts/${contactId}/campaigns`);
  return res.data;
};

// --- Default stage template used by every new campaign ---

export const getStageTemplates = async () => {
  const res = await axios.get(`${API}/stage-templates`);
  return res.data;
};

export const saveStageTemplates = async (stages) => {
  const res = await axios.put(`${API}/stage-templates`, { stages });
  return res.data;
};
