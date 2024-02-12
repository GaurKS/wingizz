require('dotenv').config();

module.exports = {
  // app secrets
  port: process.env.PORT,

  // mongodb secrets
  mongo_uri: process.env.MONGODB_URI,
  mongo_database: process.env.MONGO_DATABASE,
  mongo_user_collection: process.env.MONGO_USER_COLLECTION,
  mongo_society_collection: process.env.MONGO_SOCIETY_COLLECTION,
  mongo_channel_collection: process.env.MONGO_CHANNEL_COLLECTION,
  mongo_post_collection: process.env.MONGO_POST_COLLECTION,
  mongo_comment_collection: process.env.MONGO_COMMENT_COLLECTION,
  mongo_reaction_collection: process.env.MONGO_REACTION_COLLECTION,
  mongo_request_collection: process.env.MONGO_REQUEST_COLLECTION,
  mongo_notification_collection: process.env.MONGO_NOTIFICATION_COLLECTION,
  mongo_event_collection: process.env.MONGO_EVENT_COLLECTION,
  mongo_invitation_collection: process.MONGO_INVITATION_COLLECTION,

  // jwt secrets
  jwt_secret: process.env.JWT_SECRET,
  jwt_token_expiry: process.env.JWT_TOKEN_EXPIRY,

  // facebook secrets
  fb_page_token: process.env.FB_PAGE_TOKEN,
  fb_page_id: process.env.FB_PAGE_ID,
};