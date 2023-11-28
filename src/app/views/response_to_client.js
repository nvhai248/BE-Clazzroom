function simpleSuccessResponse(data, message) {
  return {
    statusCode: 200,
    message: message,
    data: data,
  };
}
module.exports = {
  simpleSuccessResponse,
};
