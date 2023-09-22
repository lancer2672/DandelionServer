const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const UserController = require("../controllers/user.controller");
const upload = require("../middleware/upload");

const router = express.Router();

router.put(
  "/update",
  verifyToken,
  upload.single("userImage"),
  UserController.updateUser
);
router.get("/search", verifyToken, UserController.searchUsers);
router.get("/:id", verifyToken, UserController.getUserById);
router.post("/list", verifyToken, UserController.getListUser);
router.put("/save-token", verifyToken, UserController.saveFCMtoken);
router.get("/friend/get-all", verifyToken, UserController.getAllFriends);

router.post(
  "/search-history/add",
  verifyToken,
  UserController.addUserToSearchHistory
);
router.delete(
  "/search-history/remove/:userId",
  verifyToken,
  UserController.removeUserFromSearchHistory
);
router.get(
  "/search-history/recent",
  verifyToken,
  UserController.getRecentSearchHistory
);

// router.post("/create", verifyToken, UserController.createUser);

module.exports = router;
