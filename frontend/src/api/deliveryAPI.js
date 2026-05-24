import { onlineBaseURL } from '../data/local-data';
  
  const BASE_URL = `${onlineBaseURL}/delivery`;

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


export const fetchDelivery = async () => request(BASE_URL, "GET");


// export const fetchDelivery = async () => {
//     const res = await fetch(BASE_URL);
//     if(!res.ok) throw new Error("Failed to fetch delivery");
//     return res.json();
// }

export const createDelivery = (data) => request (BASE_URL,'POST', data);

export const updateDelivery = (id , data) => request(`${BASE_URL}/${id}`,'PUT', data);  

// export const deleteDelivery = async (id) => {
//     const res = await fetch(`${BASE_URL}/${id}`, {
//         method: 'DELETE',
//     });
//     if(!res.ok) throw new Error("Failed to delete delivery");
//     return res.json();
// };

export const deleteDelivery = async (id) => request(`${BASE_URL}/${id}`,'DELETE');
