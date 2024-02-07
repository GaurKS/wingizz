const { fetchSociety } = require("../mongodb/society.mongo");

const isSocietyIdValid = async (ctx) => {
  const mongoClient = await ctx.dbClient;
  const { sid } = ctx.params;
  const society = fetchSociety(mongoClient, sid);

  if (!society) {
    return new Error(`Invalid society id`)
  }
  ctx.society = society;
  return null;
}

module.exports = {
  isSocietyIdValid
}
