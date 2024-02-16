class Booking {
  constructor(eid, cid, rid, date, requestedBy) {
    this.bookingId = eid;
    this.channelId = cid;
    this.resourceId = rid;
    this.date = date;
    this.requestedBy = requestedBy;
    this.createdAt = new Date();
  }
}

module.exports = Booking; 