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

function errorBadRequest(status, message) {
  return {
    statusCode: status,
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

module.exports = {
  errorCustom,
  errorBadRequest,
  errorUnauthorized,
  errorNotFound,
  errorInternalServer,
};
