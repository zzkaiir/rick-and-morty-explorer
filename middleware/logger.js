// Log the date, time, HTTP method, and URL of each request
function logger(req, res, next) {
    const time = new Date().toLocaleString();

    console.log(`${time} - ${req.method} ${req.url}`);

    next();
}

module.exports = logger;