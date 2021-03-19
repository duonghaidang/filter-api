import axios from 'axios';

const BASE_URL = 'https://xn--h62bo6uvrb81m.com:5001/api/v1/';

let API = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});
//! log URL API
API.interceptors.response.use((response) => {
  if (response?.request?.responseURL)
    console.log('URL ->', '\u001b[34m' + decodeURI(response?.request?.responseURL.replace(BASE_URL, '')));
  return response;
});
export default API;
