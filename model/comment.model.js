class Comment {
  constructor(postId, text, commentBy, parentId,) {
    this.postId = postId;
    this.commentBy = commentBy;
    this.parentId = parentId;
    this.text = text;
    this.upvote = 0;
    this.createdAt = new Date();
  }
}


module.exports = Comment;