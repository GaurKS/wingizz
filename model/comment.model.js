class Comment {
  constructor(commentId, postId, author, channelId, text, media) {
    this.commentId = commentId;
    this.postId = postId;  // linked to post
    this.author = author;
    this.channelId = channelId;
    this.text = text;
    this.media = media;
    this.reaction = [];
    this.createdAt = new Date();
  }
}

module.exports = Comment;