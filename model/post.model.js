class Post {
  constructor(postId, channelId, text, media, postedBy) {
    this.postId = postId;
    this.channelId = channelId;
    this.text = text;
    this.media = media; // array of media urls
    this.author = postedBy;
    this.upvote = 0;
    this.createdAt = new Date();
  }
}

module.exports = Post;