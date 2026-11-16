
function errorHandler(err, req, res, next) {
    console.error("Application error:", err);

    if (res.headersSent) {
        return next(err);
    }

    let statusCode = 500;
    let message = "Something went wrong. Please try again later.";

    if (err.response) {
        statusCode = err.response.status;

        if (statusCode === 429) {
            message = "Too many requests. Please try again later.";
        } else if (statusCode >= 500) {
            message = "The API server is currently unavailable. Please try again later.";
        }
    } else if (err.code === "ECONNABORTED") {
        message = "The request timed out. Please try again later.";
    } else if (err.code === "ERR_NETWORK" || !err.response) {
        message = "Unable to connect to the server. Please check your internet connection.";
    }

    res.status(statusCode).render("error", {
        message: message
    });
}

module.exports = errorHandler;
