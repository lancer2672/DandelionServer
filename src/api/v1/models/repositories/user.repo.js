const User = require("../user.model");

class UserRepository {
  static async findById(userId, session = null) {
    return await User.findById(userId).session(session).exec();
  }
  static async findOne(query, session) {
    console.log("UserRepository", User);
    return await User.findOne(query).session(session).exec();
  }
  static async findAll() {
    return await User.find().exec();
  }

  static async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  static async update(userId, updateData, session = null) {
    console.log("update", { userId, updateData });
    return await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    })
      .session(session)
      .exec();
  }
}

module.exports = UserRepository;
