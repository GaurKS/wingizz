class Request {
  constructor(requestId, channelId, description, resourceId, status, date, requestedBy) {
    this.requestId = requestId;
    this.channelId = channelId;
    this.description = description;
    this.resourceId = resourceId;
    this.status = status;
    this.requestedDate = date;
    this.requestedBy = requestedBy;
    this.upvote = 0;
    this.createdAt = new Date();
  }
}

module.exports = Request;