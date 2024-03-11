const User = require("../user.model");

class UserRepository {
  static async findById(userId) {
    return await User.findById(userId).exec();
  }
  static async findOne(query) {
    console.log("UserRepository", User);
    return await User.findOne(query).exec();
  }
  static async findAll() {
    return await User.find().exec();
  }

  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async update(userId, updateData) {
    console.log("update", { userId, updateData });
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).exec();
  }
}

module.exports = UserRepository;
