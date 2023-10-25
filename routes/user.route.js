const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const UserController = require("../controllers/user.controller");
const { uploadImage } = require("../middleware/upload");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

router.put(
  "/update",
  verifyToken,
  // TODO
  // uploadImage.single("userImage"),
  errorHandler(UserController.updateUser)
);
router.get("/search", verifyToken, errorHandler(UserController.searchUsers));
router.get("/:id", verifyToken, errorHandler(UserController.getUserById));
router.post("/list", verifyToken, errorHandler(UserController.getListUser));
router.put(
  "/save-token",
  verifyToken,
  errorHandler(UserController.saveFCMtoken)
);
router.get(
  "/friend/get-all",
  verifyToken,
  errorHandler(UserController.getAllFriends)
);

router.post(
  "/search-history/add",
  verifyToken,
  errorHandler(UserController.addUserToSearchHistory)
);
router.delete(
  "/search-history/remove/:userId",
  verifyToken,
  errorHandler(UserController.removeUserFromSearchHistory)
);
router.get(
  "/search-history/recent",
  verifyToken,
  errorHandler(UserController.getRecentSearchHistory)
);

// router.post("/create", verifyToken, UserController.createUser);

module.exports = router;
