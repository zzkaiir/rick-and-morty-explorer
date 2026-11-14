
const axios = require("axios");

const api = axios.create({
    baseURL: process.env.API_BASE_URL,
    timeout: 10000
});

const responseCache = new Map();

const CACHE_DURATION = 10 * 60 * 1000;

async function getCachedApiData(url, params = {}) {
    const cacheKey = `${url}?${JSON.stringify(params)}`;

    const cached = responseCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    const request = api.get(url, { params: params })
        .then(response => {
            const current = responseCache.get(cacheKey);

            if (current && current.data === request) {
                current.expiresAt = Date.now() + CACHE_DURATION;
            }

            return response.data;
        })
        .catch(error => {
            responseCache.delete(cacheKey);
            throw error;
        });

    responseCache.set(cacheKey, {
        data: request,
        expiresAt: Infinity
    });

    return request;
}

async function getCharacters(params = {}) {
    return getCachedApiData("/character", params);
}

async function getAllCharacters() {
    const firstData = await getCachedApiData("/character");

    const totalCharacters = firstData.info.count;

    const characterIds = Array.from(
        { length: totalCharacters },
        (_, index) => index + 1
    );

    const data = await getCachedApiData(
        `/character/${characterIds.join(",")}`
    );

    return Array.isArray(data) ? data : [data];
}

async function getCharacterById(id) {
    return getCachedApiData(`/character/${id}`);
}

async function getEpisodes() {
   const firstData = await getCachedApiData("/episode");

    const totalPages = firstData.info.pages;
    let episodes = firstData.results;

    for (let page = 2; page <= totalPages; page++) {
       const data = await getCachedApiData("/episode", {
            page: page
        });

        episodes = episodes.concat(data.results);
    }

    return episodes;
}

async function getLocations() {
    const firstData = await getCachedApiData("/location");

    const totalPages = firstData.info.pages;
    let locations = firstData.results;

    for (let page = 2; page <= totalPages; page++) {
        const data = await getCachedApiData("/location", {
            page: page
        });

        locations = locations.concat(data.results);
    }

    return locations;
}

async function getEpisodeById(id) {
    return getCachedApiData(`/episode/${id}`);
}

async function getCharactersByUrls(urls) {
    const characterIds = [...new Set(
        urls.map(url => url.split("/").pop())
    )];

    const data = await getCachedApiData(
        `/character/${characterIds.join(",")}`
    );

    return Array.isArray(data) ? data : [data];
}

module.exports = {
    getCharacters,
    getAllCharacters,
    getCharacterById,
    getEpisodes,
    getLocations,
    getEpisodeById,
    getCharactersByUrls
};
