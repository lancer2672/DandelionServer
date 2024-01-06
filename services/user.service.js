const User = require("../models/user.model");
const SearchHistory = require("../models/searchhistory.model");
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
  NotFoundError,
} = require("../classes/error/ErrorResponse");
const { OK, CreatedResponse } = require("../classes/success/SuccessResponse");
const S3ClientIns = require("../s3Client");

class UserService {
  static async updateUser(userId, userToUpdate) {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      userToUpdate,
      {
        new: true,
      }
    );
    return updatedUser;
  }

  static async addUserToSearchHistory(userId, searchedUserId) {
    const user = await User.findById(searchedUserId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await SearchHistory.updateOne(
      { user: userId },
      {
        $push: {
          searchedUsers: { userId: searchedUserId, searchTime: new Date() },
        },
      },
      { upsert: true }
    );
  }

  static async removeUserFromSearchHistory(userId, searchedUserId) {
    const user = await User.findById(searchedUserId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    await SearchHistory.updateOne(
      { user: userId, "searchedUsers.userId": searchedUserId },
      { $set: { "searchedUsers.$.deletedAt": new Date() } }
    );
  }
  static async getRecentSearchHistory(userId) {
    const searchHistory = await SearchHistory.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { $unwind: "$searchedUsers" },
      { $match: { "searchedUsers.deletedAt": { $exists: false } } },
      {
        $group: {
          _id: "$searchedUsers.userId",
          lastSearchTime: { $max: "$searchedUsers.searchTime" },
        },
      },
      { $sort: { lastSearchTime: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          let: { userId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$userId"] } } },
            { $project: { password: 0 } },
          ],
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
    ]);
    const userIds = searchHistory.map((item) => item._id);
    const users = await User.find({ _id: { $in: userIds } });
    return users;
  }
  static async searchUsers(keyword, userId) {
    const users = await User.find({ nickname: new RegExp(keyword, "i") });
    const mappedUser1 = users.filter((user) => {
      if (user.toObject()._id != userId) {
        return user;
      }
    });
    const mappedUser2 = mappedUser1.map((user) => {
      const userObject = user.toObject();
      if (userObject._id != userId) {
        delete userObject.password;
        return userObject;
      }
    });
    return mappedUser2;
  }

  static async getUserById(id, select = { password: 2 }) {
    const user = await User.findById(id).select(select).lean();
    return { user };
  }

  static async getListUser(listIds, select = { password: 2 }) {
    const users = await User.find({ _id: { $in: listIds } })
      .select(select)
      .lean();
    return { users };
  }

  static async saveFCMtoken(userId, token) {
    const user = await User.findById(userId);
    user.FCMtoken = token;
    await user.save();
    return {};
  }

  static async getAllFriends(userId) {
    const user = await User.findById(userId).populate("friends.userId");
    if (!user) {
      throw new NotFoundError("User not found");
    }
    const friends = user.friends.map((friend) => friend.userId);
    return { friends };
  }
  static async updateUrl({ userId, fileId }) {
    const newUrl = await S3ClientIns.getSignedUrl(fileId);
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    user.avatar.url = newUrl;
    console.log("updateUrl", newUrl);
    await user.save();
    return { url: newUrl };
  }
}

module.exports = UserService;
