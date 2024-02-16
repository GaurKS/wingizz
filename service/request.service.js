const envConfig = require("../config/env.config");
const AppException = require("../exception/app.exception");
const Booking = require("../model/booking.model");
const Request = require("../model/request.model");
const { fetchAllRequests, createRequest } = require("../mongodb/request.mongo");
const { createSuccessResponse } = require("../utils/createResponse");
const { generateUid } = require('../utils/generateUid');
const { requestStatus } = require("../utils/types.enum");



exports.getAllRequest = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const { status, limit, skip, sort } = ctx.query;
  const requests = await fetchAllRequests(mongoClient, ctx.params.cid, status, sort, limit, skip);
  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: "Requests found successfully",
      data: requests
    }
  );

}

exports.getRequest = async (ctx) => {
  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: "Request found successfully",
      request: ctx.Request
    }
  )
}

exports.createRequest = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const { resourceId, description, date, publicPost } = ctx.request.body;

  // check resource availablity
  const request = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_event_collection)
    .findOne({ resourceId: resourceId, date: date })

  if (request) {
    throw new AppException(`Resource not available`, `Resource not available`, 400);
  }

  // raise request with pending status
  const newRequest = new Request(
    generateUid("rid_"),
    ctx.params.cid,
    description,
    resourceId,
    requestStatus.PENDING,
    date,
    ctx.user.id
  )

  const result = await createRequest(mongoClient, newRequest);
  if (!result) {
    throw new AppException(`Request creation failed`, `Request creation failed`, 500);
  }

  ctx.status = 201;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Request raised successfully',
      request: result
    }
  )
}

exports.editRequest = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const { status } = ctx.request.body;

  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .updateOne({ channelId: ctx.params.cid, requestId: ctx.params.rid }, { $set: { status: status } });

  if (!result) {
    throw new AppException(`Request update failed`, `Request update failed`, 500);
  }

  // create a event if request is approved
  if (status === requestStatus.APPROVED) {
    const newBooking = new Booking(
      generateUid("eid_"),
      ctx.params.cid,
      ctx.params.rid,
      ctx.Request.date,
      ctx.Request.requestedBy
    )

    const bookingResult = await mongoClient
      .db(envConfig.mongo_database)
      .collection(envConfig.mongo_event_collection)
      .insertOne(newBooking);

    result.bookingId = bookingResult.newBooking.bookingId
  }
  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Request updated successfully',
      request: result
    }
  )
}

exports.deleteRequest = async (ctx) => {
  const mongoClient = ctx.dbClient;
  const result = await mongoClient
    .db(envConfig.mongo_database)
    .collection(envConfig.mongo_request_collection)
    .deleteOne({ channelId: ctx.params.cid, requestId: ctx.params.rid });

  if (!result) {
    throw new AppException(`Request deletion failed`, `Request deletion failed`, 500);
  }

  ctx.status = 200;
  ctx.body = createSuccessResponse(
    ctx.originalUrl,
    ctx.method,
    ctx.status,
    {
      message: 'Request deleted successfully',
      request: result
    }
  )
}
