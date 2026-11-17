// Load variables from .env
require("dotenv").config();

const express = require("express");
const path = require("path");

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");
const indexRoutes = require("./routes");

const app = express();

// Configure EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Built-in middleware: form data, JSON bodies and static files
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
// Custom middleware: log every request
app.use(logger);
// Application routes
app.use("/", indexRoutes);
// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).render("404");
});
// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});