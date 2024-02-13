const joi = require("joi");
const { fetchChannel } = require("../mongodb/channel.mongo");
const { fetchReaction } = require("../mongodb/post.mongo");


exports.validateCreatePostBody = async (ctx, next) => {
  const createPostBody = joi.object({
    text: joi.string().required(),
    media: joi.array().items(joi.string().uri()).max(5).optional(),
    publicPost: joi.boolean().required()
  });

  const value = await createPostBody.validateAsync(ctx.request.body);
  ctx.request.body = value;
  await next();
}


exports.isUserValid = async (ctx) => {
  const { post } = ctx;
  const { user } = ctx;
  if (user.channels.indexOf(post.channelId) === -1) {
    return new Error(`User not allowed to read this comment`)
  }
  return null;
}

exports.isChannelValid = async (ctx) => {
  const { cid } = ctx.params;
  const mongoClient = await ctx.dbClient;
  const channel = await fetchChannel(mongoClient, cid);
  if (!channel) {
    return new Error(`Invalid channel id`)
  }

  ctx.channel = channel;
  return null;
}

exports.isChannelMember = async (ctx) => {
  const { user } = ctx;
  if (ctx.channel && (ctx.channel.members.indexOf(user.id) !== -1 || ctx.channel.admins.indexOf(user.id) === -1)) {
    return null;
  }
  return new Error(`User is not a member of this channel`)

}

exports.isAuthorValid = async (ctx) => {
  const { post, user } = ctx;
  if (post && post.author !== user.id) {
    return new Error(`User not allowed to edit this post`)
  }
  return null;
}

// exports.checkPostReaction = async (ctx) => {
//   const { post } = ctx;
//   const mongoClient = await ctx.dbClient;

//   const reaction = await fetchReaction(mongoClient, ctx.params.pid, null, ctx.user.id);

//   if (reaction) {
//     return new Error(`Invalid reaction`)
//   }
//   return null;
// }


