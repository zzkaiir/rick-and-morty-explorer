
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
            totalPages: data.info.pages
        });

    } catch (error) {
        next(error);
    }
}

module.exports = {
    showCharacters
};
