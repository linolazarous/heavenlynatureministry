import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

export const getSermons = async (skip = 0, limit = 20) => {
  const response = await api.get(`/sermons?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getEvents = async (skip = 0, limit = 20, upcoming = true) => {
  const response = await api.get(`/events?skip=${skip}&limit=${limit}&upcoming=${upcoming}`);
  return response.data;
};

export const createRSVP = async (eventId, rsvpData) => {
  const response = await api.post(`/events/${eventId}/rsvp`, rsvpData);
  return response.data;
};

export const createDonationCheckout = async (donationData) => {
  const response = await api.post("/donations/checkout", donationData, {
    headers: {
      Origin: window.location.origin,
    },
  });
  return response.data;
};

export const getDonationStatus = async (sessionId) => {
  const response = await api.get(`/donations/status/${sessionId}`);
  return response.data;
};

export const createPrayerRequest = async (prayerData) => {
  const response = await api.post("/prayers", prayerData);
  return response.data;
};

export const getPrayers = async (skip = 0, limit = 20) => {
  const response = await api.get(`/prayers?skip=${skip}&limit=${limit}&public_only=true`);
  return response.data;
};

export const createVolunteer = async (volunteerData) => {
  const response = await api.post("/volunteers", volunteerData);
  return response.data;
};

export const getBlogPosts = async (skip = 0, limit = 20) => {
  const response = await api.get(`/blog?skip=${skip}&limit=${limit}`);
  return response.data;
};

export const getResources = async (skip = 0, limit = 50, category = null) => {
  let url = `/resources?skip=${skip}&limit=${limit}`;
  if (category) url += `&category=${category}`;
  const response = await api.get(url);
  return response.data;
};

export const getCurrentLivestream = async () => {
  const response = await api.get("/livestream/current");
  return response.data;
};

export const getMinistryInfo = async () => {
  const response = await api.get("/ministry/info");
  return response.data;
};