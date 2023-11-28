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

function errorBadRequest() {
  return {
    statusCode: 400,
    message: "Bad Request",
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
