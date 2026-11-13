
const express = require("express");
const router = express.Router();

const characterController = require("../controllers/characterController");

router.get("/", (req, res) => {
    res.render("home");
});

router.get("/characters", characterController.showCharacters);
router.get("/search", characterController.searchCharacters);
router.get("/character/:id", characterController.showCharacterDetails);
module.exports = router;
