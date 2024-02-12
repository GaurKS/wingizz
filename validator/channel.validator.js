exports.isChannelValid = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { cid } = ctx.params;
  const channel = await fetchChannel(mongoClient, cid);

  if (!channel) {
    return new Error(`Invalid channel id`)
  }
  ctx.channel = channel;
  return null;
}