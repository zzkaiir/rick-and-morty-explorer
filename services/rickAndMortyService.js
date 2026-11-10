
const axios = require("axios");

const api = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 10000
});

async function getCharacters(params = {}) {
    const response = await api.get("/character", {
        params: params
    });

    return response.data;
}

async function getCharacterById(id) {
    const response = await api.get(`/character/${id}`);

    return response.data;
}

async function getEpisodes() {
    const response = await api.get("/episode");

    return response.data;
}

module.exports = {
    getCharacters,
    getCharacterById,
    getEpisodes
};
