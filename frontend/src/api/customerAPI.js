 
 import { onlineBaseURL } from '../data/local-data';
 
 const BASE_URL = `${onlineBaseURL}/customers`;

// ✅ Helper to get token from localStorage
const getToken = () => localStorage.getItem("token");

// const request = async (url, method, data) => {
//     const token = getToken(); // get JWT token
    
//     const res = await fetch(url, {
//         method,
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data),
//     });
//     const resData = await res.json();
    
//      if (!res.ok) {    
//     throw new Error(resData.error || `${method} request failed`);
//   }

//  return { status: res.status, ...resData };
// }

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


// Original code
// export const fetchCustomers = async () => {
//     const res = await fetch(BASE_URL);
//     if(!res.ok) throw new Error("Failed to fetch customers");
//     return res.json();
// }

// ✅ GET customers (with token)
// export const fetchCustomers = async () => {
//   const token = getToken();
//   const res = await fetch(BASE_URL, {
//     headers: {
//       ...(token && { Authorization: `Bearer ${token}` }), // ✅ include token here too
//     },
//   });

//   if (!res.ok) throw new Error("Failed to fetch customers");
//   return res.json();
// };

export const fetchCustomers = async () => request(BASE_URL, "GET");

export const createCustomer = async (data) => request (BASE_URL,'POST', data);

export const updateCustomer = async (id , data) => request(`${BASE_URL}/${id}`,'PUT', data);  

export const deleteCustomer = async (id) => request(`${BASE_URL}/${id}`,'DELETE');
