import api from "./axios";

// Accounts
export const signup = (data) => api.post("/users/signup/", data);
export const login = (data) => api.post("/token/", data);
export const getMe = () => api.get("/users/me/");

// Client Profiles
export const listClients = (params = {}) => api.get("/clients/", { params });
export const getClient = (id) => api.get(`/clients/${id}/`);
export const createClient = (data) => api.post("/clients/", data);
export const updateClient = (id, data) => api.patch(`/clients/${id}/`, data);
export const deleteClient = (id) => api.delete(`/clients/${id}/`);
export const getMyClient = () => api.get("/clients/me/");
export const getMatches = (params = {}) => api.get("/clients/matches/", { params });

// Tag Lookups
export const getHobbies = () => api.get("/hobbies/");
export const getFoods = () => api.get("/favourite-foods/");
export const getGenres = () => api.get("/movie-genres/");
