const express = require("express");
const verifyToken = require("../middleware/verifyToken");
const UserController = require("../controllers/user.controller");
const errorHandler = require("../middleware/errorHandler");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: User
 */
/**
 * @swagger
 * /user/friend/get-all:
 *   get:
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Friends retrieved successfully
 */
router.get(
  "/friend/get-all",
  verifyToken,
  errorHandler(UserController.getAllFriends)
);

/**
 * @swagger
 * /user/search-history/recent:
 *   get:
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Search history retrieved successfully
 */
router.get(
  "/search-history/recent",
  verifyToken,
  errorHandler(UserController.getRecentSearchHistory)
);

/**
 * @swagger
 * /user/search:
 *   get:
 *     tags: [User]
 *     responses:
 *       200:
 *         description: Search completed successfully
 */
router.get("/search", verifyToken, errorHandler(UserController.searchUsers));

/**
 * @swagger
 * /user/{id}:
 *   get:
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric ID of the user to get
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User retrieved successfully
 */
router.get("/:id", verifyToken, errorHandler(UserController.getUserById));

/**
 * @swagger
 * /user/save-token:
 *   put:
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User token saved successfully
 */
router.put(
  "/save-token",
  verifyToken,
  errorHandler(UserController.saveFCMtoken)
);

/**
 * @swagger
 * /user/update:
 *   put:
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put("/update", verifyToken, errorHandler(UserController.updateUser));

/**
 * @swagger
 * /user/search-history/add:
 *   post:
 *     tags: [User]
 *     responses:
 *       200:
 *         description: User added to search history successfully
 */
router.post(
  "/search-history/add",
  verifyToken,
  errorHandler(UserController.addUserToSearchHistory)
);

/**
 * @swagger
 * /user/search-history/remove/{userId}:
 *   delete:
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: Numeric ID of the user to remove from search history
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User removed from search history successfully
 */
router.delete(
  "/search-history/remove/:userId",
  verifyToken,
  errorHandler(UserController.removeUserFromSearchHistory)
);

module.exports = router;
