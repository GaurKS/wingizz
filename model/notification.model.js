class Notification {
  constructor(id, title, description, to, from, date) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.to = to;
    this.from = from;
    this.date = date;
    this.createdAt = new Date();
  }
}

module.exports = Notification;