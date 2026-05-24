import { onlineBaseURL } from '../data/local-data';

const BASE_URL = `${onlineBaseURL}/auth`;

const post = async (url, data) => {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

   const resData = await res.json();   

  const result = {      
    status: res.status,
    ok: res.ok,
    data: resData,
  };
 
if (!res.ok) {
    // Attach the backend message to the error object
    const error = new Error(resData.message || "Request failed");
    error.status = res.status;
    error.details = resData;
    throw error;
  }

  return {
    status: res.status,
    ok: res.ok,
    data: resData,
  };
};

// Login user
export const login = (userPhone, userPassword) =>
  post(`${BASE_URL}/login`, { userPhone, userPassword });