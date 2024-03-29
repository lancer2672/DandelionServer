const FriendRequestModel = require("../friendrequest.model");

class FriendRequestRepository {
  static async findExistedPendingFriendRequest(
    senderId,
    receiverId,
    session = null
  ) {
    return await FriendRequestModel.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    }).session(session);
  }

  static async updateFriendRequestStatus(request, status, session = null) {
    request.status = status;
    return await FriendRequestModel.findByIdAndUpdate(request._id, request, {
      new: true,
    }).session(session);
  }
}

module.exports = FriendRequestRepository;
