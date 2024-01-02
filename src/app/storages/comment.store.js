const Comment = require("../models/comment.model");
const mongooseHelper = require("../utils/mongoose.helper");

class CommentStore {
  findCommentsByReviewId = async (reviewId) => {
    return mongooseHelper.multiMongooseToObject(
      await Comment.find({ review_id: reviewId })
    );
  };
}

module.exports = new CommentStore();
