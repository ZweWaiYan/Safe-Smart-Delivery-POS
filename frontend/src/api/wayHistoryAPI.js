import { onlineBaseURL } from '../data/local-data';
  
  const BASE_URL = `${onlineBaseURL}/wayHistory`;

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

//Create
export const createWayHistory = async (requestBody) => {  
  return request(BASE_URL, 'POST', requestBody);
};

//Update
export const updateWayHistory = async (wayId, newStatusObj) => {      
  return request(`${BASE_URL}/${wayId}`, "PUT", newStatusObj);
};

export const bulkUpdateWayHistory = async (wayIds, currentTimestamp) => 
    request(`${BASE_URL}`, "PATCH", { wayIds, currentTimestamp });

//Read
export const getWayHistory = async (wayId) => {
  return request(`${BASE_URL}/${wayId}`, "GET");
};

//Delete
export const deleteWayHistory = async (wayId) => {
  return request(`${BASE_URL}/${wayId}`, "DELETE");
};