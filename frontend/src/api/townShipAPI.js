import { onlineBaseURL } from '../data/local-data';
  
  const BASE_URL = `${onlineBaseURL}/townShip`;

const request = async (url, method, data) => {
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });
     const resData = await res.json();
    
     if (!res.ok) {    
    throw new Error(resData.error || `${method} request failed`);
      }

 return { status: res.status, ...resData };
}

export const fetchTownShip = async () => {
    const res = await fetch(BASE_URL);    
    if(!res.ok) throw new Error("Failed to fetch townShip");
    return res.json();
}

export const createTownShip = async (data) => request (BASE_URL,'POST', data);

export const updateTownShip = async (id , data) => request(`${BASE_URL}/${id}`,'PUT', data);  

export const deleteTownShip = async (id) => request(`${BASE_URL}/${id}`,'DELETE');