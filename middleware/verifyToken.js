const jwt = require("jsonwebtoken");
const CredentialService = require("../services/credential.service");
const verifyToken = (req, res, next) => {
  const authHeader = req.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ sucess: false, message: "Access Token not found" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    return res.status(403).json({ sucess: false, message: "Invalid Token" });
  }
};

module.exports = verifyToken;
