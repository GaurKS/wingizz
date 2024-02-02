const { v4: uuidv4 } = require('uuid');

exports.generateUid = (prefix) => {
  const uuid = uuidv4();

  // Extract the last 8 characters to create a short UUID
  const shortUUID = uuid.substr(uuid.length - 5);
  const prefixedUUID = prefix + shortUUID;

  return prefixedUUID;
};