class Request {
  constructor(rid, cid, title, type, status, requestedBy, requestedTo, requestedFor, date) {
    this.requestId = rid;
    this.channelId = cid;
    this.requestTitle = title;
    this.requestType = type;
    this.status = status;
    this.requestedBy = requestedBy;
    this.requestedTo = requestedTo;
    this.requestedFor = requestedFor; // array of reource ids
    this.date = date;
    this.createdAt = new Date();
  }
}



module.exports = Request;