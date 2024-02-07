class Channel {
  constructor(id, societyId, wingId, type, channelName, members, admins, posts, resources, events) {
    this.channelId = id;
    this.sid = societyId;
    this.wid = wingId;
    this.channelType = type;
    this.channelName = channelName;
    this.members = members;
    this.admins = admins;
    this.posts = posts; // []
    this.resources = resources; // array of common resources
    this.events = events // []
    this.createdAt = new Date();
  }
}

// resource
// {
//   resourceId: "rid_",
//   resourceName: "resourceName",
//   count: "resourceType",
//   capacity: "resourceCapacity"
// }

// wing
// {
//   wingId: "wid_",
//   wingName: "wingName",
//   resources: [
//     {
//       resourceId: "rid_",
//       count: "resourceCount"
//       capacity: "resourceCapacity"
//     },
//   ]
// }

// members = [uid00231, uid00232, uid00233]
// admins = [uid00231, uid00232]

module.exports = Channel;