function errorHandler(err, req, res, next) {
    console.error("Application error:", err);

    res.status(err.status || 500).render("error", {
        message: "Something went wrong. Please try again later."
    });
}

module.exports = errorHandler;