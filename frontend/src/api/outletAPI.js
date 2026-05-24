import { onlineBaseURL } from '../data/local-data';
  
  const BASE_URL = `${onlineBaseURL}/outlet`;

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

export const fetchOutlet = async () => request(BASE_URL, "GET");

export const createOutlet = (data) => request (BASE_URL,'POST', data);

export const updateOutlet = (id , data) => request(`${BASE_URL}/${id}`,'PUT', data);  

export const deleteOutlet = async (id) => request(`${BASE_URL}/${id}`,'DELETE');