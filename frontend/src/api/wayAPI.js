import { onlineBaseURL } from '../data/local-data';
  
  const BASE_URL = `${onlineBaseURL}/way`;

const getToken = () => localStorage.getItem("token");

const request = async (url,  method = "GET", data) => {
  const token = getToken(); // get JWT token  

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
        // if (token) headers.Authorization = `Bearer ${token}`;
      ...(token && { Authorization: `Bearer ${token}` }), // ✅ attach JWT if exists
    },
  };

  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }

  const res = await fetch(url, options);
  const resData = await res.json();

  if (!res.ok) {
    throw new Error(resData.message || resData.error || `${method} request failed`);
  }

return (method !== "GET") ? { status: res.status, ...resData } :  resData ;

};

export const fetchWay = async () => request(BASE_URL, "GET");


export const createWay = (data) => request (BASE_URL,'POST', data);

export const updateWay = (id , data) => request(`${BASE_URL}/${id}`,'PUT', data);  

export const updateStatusOnly = async (wayId, data) =>
  request(`${BASE_URL}/${wayId}`, "PATCH", data);

export const updateAllStatusToday = async (wayIds) => 
  request(`${BASE_URL}/update-all-status-today`, "PATCH", { wayIds });

export const deleteWay = async (id) => request(`${BASE_URL}/${id}`,'DELETE');

// Fetch counts of all statuses
export const wayCountsAll = async () => request(`${BASE_URL}/count-all`, "GET");
