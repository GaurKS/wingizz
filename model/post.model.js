class Post {
  constructor(postId, text, media, postedBy) {
    this.postId = postId;
    this.text = text;
    this.media = media;
    this.createdBy = postedBy;
    this.upvote = 0;
    this.createdAt = new Date();
  }
}