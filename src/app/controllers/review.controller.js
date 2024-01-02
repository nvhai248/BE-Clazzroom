const classStore = require("../storages/class.store");
const gradeCompositionStore = require("../storages/gradeComposition.store");
const gradeReviewStore = require("../storages/gradeReview.store");
const studentStore = require("../storages/student.store");
const userStore = require("../storages/user.store");
const { errNoPermission, errorBadRequest } = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

class ReviewController {
  // [GET] /api/reviews?class_id=&state=
  getListReview = async (req, res) => {
    const classId = req.query.class_id;
    const state = req.query.state;

    var reviews = await gradeReviewStore.getListByStateAndClassId(
      state,
      classId
    );

    for (var i = 0; i < reviews.length; i++) {
      // find class
      var reviewClass = await classStore.findClassById(reviews[i].class_id);
      reviews[i].class = {
        _id: reviewClass._id,
        class: reviewClass.class_name,
      };

      // grade composition
      var gradeComposition =
        await gradeCompositionStore.findGradeCompositionById(
          reviews[i].grade_composition_id
        );

      reviews[i].grade_composition_id = {
        _id: gradeComposition._id,
        name: gradeComposition.name,
      };

      // student
      var student = await studentStore.findStudentByStudentIdAndClassId(
        reviews[i].student_id,
        reviews[i].class_id
      );

      var user = await userStore.findUserByStudentId(reviews[i].student_id);
      reviews[i].student = {
        student_id: student.student_id,
        account_id: user._id,
        full_name: student.full_name,
      };
    }

    res.status(200).send(simpleSuccessResponse(reviews, "Successfully"));
  };

  // [GET] /api/reviews/:id
  getReviewDetail = async (req, res) => {
    const id = req.params.id;

    if (!id) {
      res.status(400).send(errorBadRequest("Invalid id!"));
    }

    var review = await gradeReviewStore.getReviewById(id);

    // find class
    var reviewClass = await classStore.findClassById(review.class_id);
    review.class = {
      _id: reviewClass._id,
      class: reviewClass.class_name,
    };

    // grade composition
    var gradeComposition = await gradeCompositionStore.findGradeCompositionById(
      review.grade_composition_id
    );

    review.grade_composition_id = {
      _id: gradeComposition._id,
      name: gradeComposition.name,
    };

    // student
    var student = await studentStore.findStudentByStudentIdAndClassId(
      review.student_id,
      review.class_id
    );

    var user = await userStore.findUserByStudentId(review.student_id);
    review.student = {
      student_id: student.student_id,
      account_id: user._id,
      full_name: student.full_name,
    };

    res.status(200).send(simpleSuccessResponse(review, "Successfully!"));
  };
}

module.exports = new ReviewController();
