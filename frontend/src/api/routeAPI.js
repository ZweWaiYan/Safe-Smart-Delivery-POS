import { onlineBaseURL } from '../data/local-data';
  
  const BASE_URL = `${onlineBaseURL}/route`;

const getToken = () => localStorage.getItem("token");

const request = async (url, method = "GET", data) => {
  const token = getToken();

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && method !== "GET" && { body: JSON.stringify(data) }),
  };

  const res = await fetch(url, options);

  let resData;
  try {
    resData = await res.json();
  } catch {
    throw new Error("Invalid JSON response from server");
  }

  if (!res.ok) {
    throw new Error(resData.message || resData.error || "API request failed");
  }

  return resData;
};

// ✅ Using request so authorization always included
export const fetchRoute = () => request(BASE_URL);

export const getUserPermissions = (userId) =>
  request(`${BASE_URL}/${userId}`);

export const createRoute = (data) =>
  request(BASE_URL, "POST", data);

export const updateRoute = (id, data) =>
  request(`${BASE_URL}/${id}`, "PUT", data);

export const deleteRoutesByUser = (userId) =>
  request(`${BASE_URL}/user/${userId}`, "DELETE");
