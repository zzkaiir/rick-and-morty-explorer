function errorHandler(err, req, res, next) {
    console.error("Application error:", err);

    if (res.headersSent) {
        return next(err);
    }

    const statusCode = err.statusCode || err.status || 500;

    res.status(statusCode).render("error", {
        message: "Something went wrong. Please try again later."
    });
}

module.exports = errorHandler;