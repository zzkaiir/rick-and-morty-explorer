// Handle application and API errors in one place
function errorHandler(err, req, res, next) {
    // Technical details go to the console, not to the user
    console.error("Application error:", err);

    // If the response has already started, let Express handle the error
    if (res.headersSent) {
        return next(err);
    }

    let statusCode = 500;
    let message = "Something went wrong. Please try again later";

    if (err.response) {
        // The API answered with an error status
        statusCode = err.response.status;

        if (statusCode === 429) {
            message = "Too many requests. Please try again later";
        } else if (statusCode >= 500) {
            message = "The API server is currently unavailable. Please try again later";
        }
    } else if (err.code === "ECONNABORTED") {
        // Axios timeout
        message = "The request timed out. Please try again later";
    } else if (err.request) {
        // The request was sent but no response came back
        message = "Unable to connect to the server. Please check your internet connection";
    }

    // Show a friendly error page instead of a stack trace
    res.status(statusCode).render("error", {
        message: message
    });
}

module.exports = errorHandler;
