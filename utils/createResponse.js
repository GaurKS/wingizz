exports.createErrorResponse = (path, method, statusCode, errorMessage) => {
  return {
    'timestamp': new Date().toISOString(),
    'path': path,
    'method': method,
    'statusCode': statusCode,
    'error': errorMessage
  }
}

exports.createSuccessResponse = (path, method, statusCode, data) => {
  return {
    'timestamp': new Date().toISOString(),
    'path': path,
    'method': method,
    'statusCode': statusCode,
    'data': data
  }
}
