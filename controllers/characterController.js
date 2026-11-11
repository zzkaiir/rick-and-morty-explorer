
const rickAndMortyService = require("../services/rickAndMortyService");

async function showCharacters(req, res, next) {
    try {
        const page = Number.parseInt(req.query.page, 10) || 1;

        if (page < 1) {
            return res.redirect("/characters");
        }

        const data = await rickAndMortyService.getCharacters({
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
            searchQuery: query
        });

    } catch (error) {
        if (error.response && error.response.status === 404) {
            return res.render("characters", {
                characters: [],
                count: 0,
                currentPage: 1,
                totalPages: 0,
                searchQuery: query
            });
        }

        next(error);
    }
}


module.exports = {
    showCharacters,
    searchCharacters
};
