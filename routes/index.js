const express = require("express");
const router = express.Router();

const characterController = require("../controllers/characterController");

// Define routes for all application pages

// Home page with the search form
router.get("/", (req, res) => {
    res.render("home");
});

// Character catalogue with search, filters, sorting and pagination
router.get("/characters", characterController.showCharacters);

// Search form handler: validates input and redirects to /characters
router.get("/search", characterController.searchCharacters);

// Details of one character
router.get("/character/:id", characterController.showCharacterDetails);

// List of all episodes and details of one episode
router.get("/episodes", characterController.showEpisodes);
router.get("/episode/:id", characterController.showEpisodeDetails);

// List of all locations and details of one location
router.get("/locations", characterController.showLocations);
router.get("/location/:id", characterController.showLocationDetails);

module.exports = router;