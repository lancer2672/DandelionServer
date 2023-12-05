const mongoose = require("mongoose");
const Schema = mongoose.Schema;
/**
 * @swagger
 * components:
 *   schemas:
 *     SearchHistory:
 *       type: object
 *       required:
 *         - user
 *         - searchedUsers
 *       properties:
 *         user:
 *           type: string
 *           description: The ID of the user who made the search.
 *         searchedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the user who was searched.
 *               searchTime:
 *                 type: string
 *                 format: date-time
 *                 description: The time when the user was searched.
 *               deletedAt:
 *                 type: string
 *                 format: date-time
 *                 description: The deletion time of the search history.
 *       example:
 *         user: "60d0fe4f7439346e18c6343a"
 *         searchedUsers: [{ userId: "60d0fe4f7439346e18c6343b", searchTime: "2023-12-05T08:39:32.000Z", deletedAt: null }]
 */

const SearchHistorySchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    searchedUsers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "user",
        },
        searchTime: {
          type: Date,
          default: Date.now,
        },
        deletedAt: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("searchHistory", SearchHistorySchema);
