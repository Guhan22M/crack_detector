import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL, // or your deployed URL
//   withCredentials: true, // if using cookies/session
});

export default instance;
