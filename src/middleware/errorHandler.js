const errorHandler = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch((error) => {
      console.log("ERROR", error);
      const statusCode = error.status || 500;
      res.status(statusCode).json({
        status: "error",
        code: statusCode,
        message: error.message || "Internal Server Error",
      });
    });
  };
};

module.exports = errorHandler;
