const axios = require("axios");

// Axios instance with the base URL from .env (with a fallback) and a 10 second timeout
const api = axios.create({
    baseURL: process.env.API_BASE_URL || "https://rickandmortyapi.com/api",
    timeout: 10000
});

// Store API responses to avoid repeated requests
const responseCache = new Map();

// Cache responses for 10 minutes
const CACHE_DURATION = 10 * 60 * 1000;

// Fetch API data and reuse cached responses when available
async function getCachedApiData(url, params = {}) {
    // The cache key is made of the URL and the request parameters
    const cacheKey = `${url}?${JSON.stringify(params)}`;

    const cached = responseCache.get(cacheKey);

    // Return the saved response if it has not expired yet
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    const request = api.get(url, { params: params })
        .then(response => {
            // The request succeeded: start the 10 minute timer
            const current = responseCache.get(cacheKey);

            if (current && current.data === request) {
                current.expiresAt = Date.now() + CACHE_DURATION;
            }

            return response.data;
        })
        .catch(error => {
            // Do not keep failed requests in the cache
            responseCache.delete(cacheKey);
            throw error;
        });

    // The promise is saved right away, so identical simultaneous requests
    // share one API call. expiresAt is Infinity until the response arrives
    responseCache.set(cacheKey, {
        data: request,
        expiresAt: Infinity
    });

    return request;
}

// Get all characters from every API page using the selected filters
async function getAllCharacters(params = {}) {
    const firstData = await getCachedApiData("/character", {
        ...params,
        page: 1
    });

    // Remaining pages are requested at the same time, not one by one
    const pageNumbers = Array.from(
        { length: firstData.info.pages - 1 },
        (_, index) => index + 2
    );

    const otherPages = await Promise.all(
        pageNumbers.map(page =>
            getCachedApiData("/character", { ...params, page: page })
        )
    );

    return firstData.results.concat(
        ...otherPages.map(data => data.results)
    );
}

// Get one character by its ID
async function getCharacterById(id) {
    return getCachedApiData(`/character/${id}`);
}

// Get all episodes from every API page
async function getEpisodes() {
    const firstData = await getCachedApiData("/episode");

    const pageNumbers = Array.from(
        { length: firstData.info.pages - 1 },
        (_, index) => index + 2
    );

    const otherPages = await Promise.all(
        pageNumbers.map(page =>
            getCachedApiData("/episode", { page: page })
        )
    );

    return firstData.results.concat(
        ...otherPages.map(data => data.results)
    );
}

// Get all locations from every API page
async function getLocations() {
    const firstData = await getCachedApiData("/location");

    const pageNumbers = Array.from(
        { length: firstData.info.pages - 1 },
        (_, index) => index + 2
    );

    const otherPages = await Promise.all(
        pageNumbers.map(page =>
            getCachedApiData("/location", { page: page })
        )
    );

    return firstData.results.concat(
        ...otherPages.map(data => data.results)
    );
}
// Get one location by its ID
async function getLocationById(id) { 
    return getCachedApiData(`/location/${id}`);
}

// Get one episode by its ID
async function getEpisodeById(id) {
    return getCachedApiData(`/episode/${id}`);
}

// Get characters using the URLs provided by an episode or location
async function getCharactersByUrls(urls) {
    if (!urls || urls.length === 0) {
        return [];
    }

    const characterIds = [...new Set(
        urls.map(url => url.split("/").pop())
    )];

    const data = await getCachedApiData(
        `/character/${characterIds.join(",")}`
    );

    return Array.isArray(data) ? data : [data];
}

module.exports = {
    getAllCharacters,
    getCharacterById,
    getEpisodes,
    getLocations,
    getLocationById,
    getEpisodeById,
    getCharactersByUrls
};
