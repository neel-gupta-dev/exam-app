const notFound = (req, res, next) => {
  const error = new Error(`Not Found — ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  // Prefer explicit statusCode on the error object (set by services),
  // then res.statusCode if already set (e.g. by controller), else 500.
  const statusCode =
    err.statusCode && err.statusCode !== 200
      ? err.statusCode
      : res.statusCode !== 200
      ? res.statusCode
      : 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

export { notFound, errorHandler };
