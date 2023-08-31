const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const UserController = require("../controllers/user.controller");
const upload = require("../middleware/upload");

const router = express.Router();

router.put(
  "/update/:id",
  verifyToken,
  upload.single("userImage"),
  UserController.updateUser
);
router.get("/search", verifyToken, UserController.searchUsers);
router.get("/:id", verifyToken, UserController.getUserById);
router.put("/save-token", verifyToken, UserController.saveFCMtoken);
router.get("/friend/get-all", verifyToken, UserController.getAllFriends);
// router.post("/create", verifyToken, UserController.createUser);

module.exports = router;
