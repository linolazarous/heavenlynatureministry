import axios from "axios";

/**
 * Vite environment variables MUST:
 * 1. Start with VITE_
 * 2. Be accessed via import.meta.env
 *
 * Example in .env:
 * VITE_BACKEND_URL=https://api.yourdomain.com
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

if (!BACKEND_URL) {
  console.error(
    "❌ VITE_BACKEND_URL is not defined. Check your .env file."
  );
}

export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  headers: {
    "Content-Type": "application/json",
  },
});

/* ================================
   Sermons
================================ */
export const getSermons = async (skip = 0, limit = 20) => {
  const { data } = await api.get(
    `/sermons?skip=${skip}&limit=${limit}`
  );
  return data;
};

/* ================================
   Events
================================ */
export const getEvents = async (
  skip = 0,
  limit = 20,
  upcoming = true
) => {
  const { data } = await api.get(
    `/events?skip=${skip}&limit=${limit}&upcoming=${upcoming}`
  );
  return data;
};

export const createRSVP = async (eventId, rsvpData) => {
  const { data } = await api.post(
    `/events/${eventId}/rsvp`,
    rsvpData
  );
  return data;
};

/* ================================
   Donations
================================ */
export const createDonationCheckout = async (donationData) => {
  const { data } = await api.post(
    "/donations/checkout",
    donationData,
    {
      headers: {
        Origin: window.location.origin,
      },
    }
  );
  return data;
};

export const getDonationStatus = async (sessionId) => {
  const { data } = await api.get(
    `/donations/status/${sessionId}`
  );
  return data;
};

/* ================================
   Prayers
================================ */
export const createPrayerRequest = async (prayerData) => {
  const { data } = await api.post(
    "/prayers",
    prayerData
  );
  return data;
};

export const getPrayers = async (skip = 0, limit = 20) => {
  const { data } = await api.get(
    `/prayers?skip=${skip}&limit=${limit}&public_only=true`
  );
  return data;
};

/* ================================
   Volunteers
================================ */
export const createVolunteer = async (volunteerData) => {
  const { data } = await api.post(
    "/volunteers",
    volunteerData
  );
  return data;
};

/* ================================
   Blog
================================ */
export const getBlogPosts = async (skip = 0, limit = 20) => {
  const { data } = await api.get(
    `/blog?skip=${skip}&limit=${limit}`
  );
  return data;
};

/* ================================
   Resources
================================ */
export const getResources = async (
  skip = 0,
  limit = 50,
  category = null
) => {
  let url = `/resources?skip=${skip}&limit=${limit}`;
  if (category) url += `&category=${category}`;

  const { data } = await api.get(url);
  return data;
};

/* ================================
   Livestream
================================ */
export const getCurrentLivestream = async () => {
  const { data } = await api.get(
    "/livestream/current"
  );
  return data;
};

/* ================================
   Ministry Info
================================ */
export const getMinistryInfo = async () => {
  const { data } = await api.get(
    "/ministry/info"
  );
  return data;
};
