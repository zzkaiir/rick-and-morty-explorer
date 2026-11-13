
const rickAndMortyService = require("../services/rickAndMortyService");
const characterCache = {
    characters: null,
    expiresAt: 0
};

const CACHE_DURATION = 10 * 60 * 1000;

async function getCachedCharacters() {
    if (
        characterCache.characters &&
        characterCache.expiresAt > Date.now()
    ) {
        return characterCache.characters;
    }

    const characters = await rickAndMortyService.getAllCharacters();

    characterCache.characters = characters;
    characterCache.expiresAt = Date.now() + CACHE_DURATION;

    return characters;
}



async function showCharacters(req, res, next) {
    try {
        const page = Number.parseInt(req.query.page, 10) || 1;

        if (page < 1) {
            return res.redirect("/characters");
        }

        const status = req.query.status || "";
        const gender = req.query.gender || "";
        const sort = req.query.sort || "asc";

        let allCharacters = await getCachedCharacters();

        allCharacters = allCharacters.filter(character => {
            const matchesStatus = !status ||
                character.status.toLowerCase() === status.toLowerCase();

            const matchesGender = !gender ||
                character.gender.toLowerCase() === gender.toLowerCase();

            return matchesStatus && matchesGender;
        });

        allCharacters.sort((a, b) => {
            const comparison = a.name.localeCompare(b.name);

            return sort === "desc" ? -comparison : comparison;
        });

        const charactersPerPage = 20;
        const startIndex = (page - 1) * charactersPerPage;

        const characters = allCharacters.slice(
            startIndex,
            startIndex + charactersPerPage
        );

        res.render("characters", {
            characters: characters,
            count: allCharacters.length,
            currentPage: page,
            totalPages: Math.ceil(allCharacters.length / charactersPerPage),
            status: status,
            gender: gender,
            sort: sort,
            searchQuery: ""
        });

    } catch (error) {
        next(error);
    }
}


async function searchCharacters(req, res, next) {
    const query = req.query.q ? req.query.q.trim() : "";

    if (!query) {
        return res.redirect("/characters");
    }

    const page = Number.parseInt(req.query.page, 10) || 1;

    try {
        const data = await rickAndMortyService.getCharacters({
            name: query,
            page: page
        });

        const characters = data.results.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        res.render("characters", {
            characters: characters,
            count: data.info.count,
            currentPage: page,
            totalPages: data.info.pages,
            status: "",
            gender: "",
            sort: "asc",
            searchQuery: query
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.render("characters", {
                characters: [],
                count: 0,
                currentPage: 1,
                totalPages: 0,
                status: "",
                gender: "",
                sort: "asc",
                searchQuery: query
            });
        }

        next(error);
    }
}

async function showCharacterDetails(req, res, next) {
    try {
        const id = Number.parseInt(req.params.id, 10);

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

module.exports = {
    showCharacters,
    searchCharacters,
    showCharacterDetails
};
