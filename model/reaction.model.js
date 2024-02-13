class Reaction {
  constructor(postId, commentId, channelId, reaction, reactedBy) {
    this.postId = postId;
    this.commentId = commentId;
    this.channelId = channelId;
    this.reaction = reaction; // 1,-1
    this.reactedBy = reactedBy;
    this.createdAt = new Date();
  }
}

module.exports = Reaction;