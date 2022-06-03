const appError = (statusCode, errMessage, next) => {
    const error = new Error(errMessage);
    error.statusCode = statusCode;
    error.isOperational = true;
    next(error);
}

module.exports = appError;