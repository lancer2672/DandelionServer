const express = require("express");
const verifyToken = require("../middleware/veryfyToken");
const UserController = require("../controllers/user.controller");
const upload = require("../middleware/upload");

const router = express.Router();

router.put("/:id", verifyToken, upload, UserController.updateUser);
router.get("/search", verifyToken, UserController.searchUsers);
router.get("/:id", verifyToken, UserController.getUserById);
// router.post("/create", verifyToken, UserController.createUser);

module.exports = router;
