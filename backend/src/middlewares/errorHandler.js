export const errorHandler = (err, req, res, next) => {
  // Log the full error to AWS CloudWatch for debugging
  console.error(err.stack || err);

  // If headers are already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // Extract status code and normalize the message
  const statusCode = err.statusCode || 500;
  const message = typeof err === "string" ? err : err.message || "Internal Server Error";

  // Send the structured JSON response
  res.status(statusCode).json({
    success: false,
    message,
    // Only expose stack traces in development environments
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
