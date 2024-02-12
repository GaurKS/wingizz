const channelType = {
  SOCIETY: 'society',
  WING: 'wing'
}

const requestType = {
  ADMIN: 'admin',
  USER: 'user'
}

const userRole = {
  ADMIN: 'admin',
  USER: 'user'
}

const roles = {
  R: 'root', // first user of the society
  S: 'secretary', // society secretary
  A: 'admin', // wing admin
  U: 'user' // society member
}

const requestStatus = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
}

const postType = {
  INVITE: 'invite',
  EVENT: 'event',
  POLL: 'poll'
}

module.exports = {
  channelType,
  requestType,
  userRole,
  roles,
  requestStatus,
  postType,
}