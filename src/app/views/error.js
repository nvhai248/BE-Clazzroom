function errorCustom(statusCode, message) {
  return {
    statusCode: statusCode,
    message: message,
  };
}

function errorInternalServer(mgs) {
  return {
    statusCode: 500,
    type: "Internal Server Error",
    message: mgs,
  };
}

function errorBadRequest(message) {
  return {
    statusCode: 400,
    type: "Bad Request",
    message: message,
  };
}

function errorUnauthorized() {
  return {
    statusCode: 401,
    message: "Unauthorized",
  };
}

function errorNotFound(message) {
  return {
    statusCode: 404,
    message: message + " Not Found",
  };
}

function errNoPermission(mgs) {
  return {
    statusCode: 404,
    type: "Forbidden",
    message: mgs,
  };
}

module.exports = {
  errorCustom,
  errorBadRequest,
  errorUnauthorized,
  errorNotFound,
  errorInternalServer,
  errNoPermission,
};
