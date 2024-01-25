const FriendRequestModel = require("../friendrequest.model");

class FriendRequestRepository {
  static async findExistedPendingFriendRequest(senderId, receiverId) {
    return await FriendRequestModel.findOne({
      sender: senderId,
      receiver: receiverId,
      status: "pending",
    });
  }

  static async updateFriendRequestStatus(request, status) {
    request.status = status;
    return await FriendRequestModel.findByIdAndUpdate(request._id, request, { new: true });
  }
}

module.exports = FriendRequestRepository;
