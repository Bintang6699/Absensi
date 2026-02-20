const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

    // Only log real server errors (500s) to keep logs clean
    if (statusCode >= 500) {
        console.error('SERVER ERROR:', err);
    }

    res.status(statusCode);

    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};
