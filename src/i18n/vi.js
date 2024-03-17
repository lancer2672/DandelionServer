class Language {
  constructor(text, code) {
    this.text = text;
    this.code = code;
  }
}

//TODO: return code instead of text
const language = {
  ACCEPT_FRIEND_REQUEST: new Language(
    (name) => `${name} đã chấp nhận lời mời kết bạn`,
    "FRIEND_REQUEST_001"
  ),
  DECLINE_FRIEND_REQUEST: new Language(
    (name) => `${name} đã từ chối lời mời kết bạn`,
    "FRIEND_REQUEST_002"
  ),
  SENT_FRIEND_REQUEST: new Language(
    (name) => `${name} đã gửi lời mời kết bạn`,
    "FRIEND_REQUEST_003"
  ),

  SENT_PHOTO: new Language((name) => `${name} đã gửi cho bạn ảnh`, "CHAT_001"),
  SENT_VIDEO: new Language(
    (name) => `${name} đã gửi cho bạn video`,
    "CHAT_002"
  ),
  MISS_CALL: new Language(
    (name) => `bạn vừa bỏ lỡ cuộc gọi từ ${name}`,
    "CHAT_003"
  ),

  REACT_POST: new Language(
    (name) => `${name} đã thích bài viết của bạn`,
    "POST_001"
  ),
  COMMENT_POST: new Language(
    (name) => `${name} đã bình luận bài viết của bạn`,
    "POST_002"
  ),
};

module.exports = language;
