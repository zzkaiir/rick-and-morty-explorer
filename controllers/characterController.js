
const rickAndMortyService = require("../services/rickAndMortyService");

// Display characters with search, filters, sorting, and pagination
async function showCharacters(req, res, next) {
    try {
        // Page number must be a positive integer, otherwise go to the first page
        const page = req.query.page === undefined
            ? 1
            : Number(req.query.page);

        if (!Number.isInteger(page) || page < 1) {
            return res.redirect("/characters");
        }

        // Search text: only a string, trimmed and limited to 50 characters
        const query = typeof req.query.q === "string"
            ? req.query.q.trim().slice(0, 50)
            : "";

        // Allowed values for filters and sorting
        const allowedStatuses = ["", "alive", "dead", "unknown"];
        const allowedGenders = ["", "female", "male", "genderless", "unknown"];
        const allowedSorts = ["asc", "desc"];

        //Checking filter values
        const status = allowedStatuses.includes(req.query.status)
            ? req.query.status
            : "";

        const gender = allowedGenders.includes(req.query.gender)
            ? req.query.gender
            : "";

        const sort = allowedSorts.includes(req.query.sort)
            ? req.query.sort
            : "asc";

        // Friendly messages about input that was changed or ignored
        const messages = [];

        if (req.query.status !== undefined && !allowedStatuses.includes(req.query.status)) {
            messages.push("Invalid status filter was ignored");
        }

        if (req.query.gender !== undefined && !allowedGenders.includes(req.query.gender)) {
            messages.push("Invalid gender filter was ignored");
        }

        if (req.query.sort !== undefined && !allowedSorts.includes(req.query.sort)) {
            messages.push("Invalid sort option. Showing A-Z instead");
        }

        if (typeof req.query.q === "string" && req.query.q.trim().length > 50) {
            messages.push("Search text was limited to 50 characters");
        }

        if (req.query.empty === "1") {
            messages.push("Please enter a character name or use the filters below");
        }

        // Send only valid filters to the API
        const apiParams = {};

        if (query) {
            apiParams.name = query;
        }

        if (status) {
            apiParams.status = status;
        }

        if (gender) {
            apiParams.gender = gender;
        }

        let allCharacters = await rickAndMortyService.getAllCharacters(apiParams);

        // Extra local filtering of the API result
        allCharacters = allCharacters.filter(character => {
            const matchesName = !query ||
                character.name.toLowerCase().includes(query.toLowerCase());

            const matchesStatus = !status ||
                character.status.toLowerCase() === status.toLowerCase();

            const matchesGender = !gender ||
                character.gender.toLowerCase() === gender.toLowerCase();

            return matchesName && matchesStatus && matchesGender;
        });

        // Sort by name A-Z or Z-A
        allCharacters.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);

            return sort === "desc" ? -comparison : comparison;
        });

        const charactersPerPage = 20;
        const totalPages = Math.ceil(allCharacters.length / charactersPerPage);

        // If the page number is too big, redirect to the last page
        if (totalPages > 0 && page > totalPages) {
            const params = new URLSearchParams();

            if (query) params.set("q", query);
            if (status) params.set("status", status);
            if (gender) params.set("gender", gender);

            params.set("sort", sort);
            params.set("page", totalPages);

            return res.redirect(`/characters?${params.toString()}`);
        }

        // Take only the characters of the current page
        const startIndex = (page - 1) * charactersPerPage;

        const characters = allCharacters.slice(
            startIndex,
            startIndex + charactersPerPage
        );

        res.render("characters", {
            characters: characters,
            count: allCharacters.length,
            currentPage: page,
            totalPages: totalPages,
            status: status,
            gender: gender,
            sort: sort,
            searchQuery: query,
            messages: messages
        });

    } catch (error) {
        // The API returns 404 when nothing matches the filters
        if (error.response && error.response.status === 404) {
            return res.render("characters", {
                characters: [],
                count: 0,
                currentPage: 1,
                totalPages: 0,
                status: req.query.status || "",
                gender: req.query.gender || "",
                sort: req.query.sort || "asc",
                searchQuery: typeof req.query.q === "string"
                    ? req.query.q.trim().slice(0, 50)
                    : "",
                messages: []
            });
        }

        next(error);
    }
}

// Process the search form and redirect to the character catalogue
function searchCharacters(req, res) {
    const query = typeof req.query.q === "string"
        ? req.query.q.trim().slice(0, 50)
        : "";

    const status = req.query.status || "";
    const gender = req.query.gender || "";
    const sort = req.query.sort || "asc";

    // Empty search without filters: show a hint instead of a silent redirect
    if (!query && !status && !gender) {
        return res.redirect("/characters?empty=1");
    }

    const params = new URLSearchParams();

    if (query) {
        params.set("q", query);
    }

    if (status) {
        params.set("status", status);
    }

    if (gender) {
        params.set("gender", gender);
    }

    params.set("sort", sort);

    res.redirect("/characters?" + params.toString());
}

// Display detailed information about a selected character
async function showCharacterDetails(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(404).render("404");
        }

        const character = await rickAndMortyService.getCharacterById(id);

        res.render("character-details", {
            character: character
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).render("404");
        }

        next(error);
    }
}

// Display all episodes
async function showEpisodes(req, res, next) {
    try {
        const episodes = await rickAndMortyService.getEpisodes();

        res.render("episodes", {
            episodes: episodes
        });

    } catch (error) {
        next(error);
    }
}
// Display all locations
async function showLocations(req, res, next) {
    try {
        const locations = await rickAndMortyService.getLocations();

        res.render("locations", {
            locations: locations
        });

    } catch (error) {
        next(error);
    }
}

// Display location details and its residents
async function showLocationDetails(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render("404");
        }

        const location = await rickAndMortyService.getLocationById(id);
        const characters = await rickAndMortyService.getCharactersByUrls(
            location.residents
        );

        res.render("location-details", {
            location: location,
            characters: characters
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).render("404");
        }

        next(error);
    }
}

// Display episode details and its characters
async function showEpisodeDetails(req, res, next) {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(404).render("404");
        }

        const episode = await rickAndMortyService.getEpisodeById(id);
        const characters = await rickAndMortyService.getCharactersByUrls(
            episode.characters
        );
    
        res.render("episode-details", {
            episode: episode,
            characters: characters
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.status(404).render("404");
        }

        next(error);
    }
}

module.exports = {
    showCharacters,
    searchCharacters,
    showCharacterDetails,
    showEpisodes,
    showLocations,
    showLocationDetails,
    showEpisodeDetails
};
