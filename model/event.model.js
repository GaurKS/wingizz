class Event {
  constructor(id, title, date, location, description, media, channelId) {
    this.eventId = id;
    this.title = title;
    this.date = date;
    this.venue = location;
    this.description = description;
    this.media = media;
    this.channelId = channelId;
    this.createdAt = new Date();
  }
}