const { publishMessage } = require("../../configs/pubsub_rabbitmq/publisher");
const classStore = require("../storages/class.store");
const classRegistrationStore = require("../storages/classRegistration.store");
const commentStore = require("../storages/comment.store");
const gradeStore = require("../storages/grade.store");
const gradeCompositionStore = require("../storages/gradeComposition.store");
const gradeReviewStore = require("../storages/gradeReview.store");
const studentStore = require("../storages/student.store");
const userStore = require("../storages/user.store");
const {
  errNoPermission,
  errorBadRequest,
  errorInternalServer,
  errorCustom,
} = require("../views/error");
const { simpleSuccessResponse } = require("../views/response_to_client");

class ReviewController {
  // [GET] /api/reviews?class_id=***&state=***&sort=***
  getListReview = async (req, res) => {
    try {
      const classId = req.query.class_id;
      const state = req.query.state;
      const sort = req.query.sort;

      const reviews = await gradeReviewStore.getListByStateAndClassId(
        req.user.role == "teacher" ? null : req.user.userId,
        state,
        classId,
        sort
      );

      const reviewPromises = reviews.map(async (review) => {
        const [reviewClass, gradeComposition, student, user] =
          await Promise.all([
            classStore.findClassById(review.class_id, {
              _id: 1,
              class_name: 1,
            }),
            gradeCompositionStore.findGradeCompositionById(
              review.grade_composition_id,
              { _id: 1, name: 1 }
            ),
            studentStore.findStudentByStudentIdAndClassId(
              review.student_id,
              review.class_id,
              { student_id: 1, full_name: 1 }
            ),
            userStore.findUserByStudentId(review.student_id, { _id: 1 }),
          ]);

        review.class = {
          _id: reviewClass._id,
          class_name: reviewClass.class_name,
        };

        review.grade_composition = {
          _id: gradeComposition._id,
          name: gradeComposition.name,
        };

        review.student = {
          student_id: student.student_id,
          account_id: user._id,
          full_name: student.full_name,
          image: user.image,
        };
      });

      await Promise.all(reviewPromises);

      res.status(200).send(simpleSuccessResponse(reviews, "Successfully"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server Error"));
    }
  };

  // [GET] /api/reviews/:id
  getReviewDetail = async (req, res) => {
    try {
      const id = req.params.id;
      const review = await gradeReviewStore.getReviewById(id);

      const [reviewClass, gradeComposition, student, user] = await Promise.all([
        classStore.findClassById(review.class_id, { _id: 1, class_name: 1 }),
        gradeCompositionStore.findGradeCompositionById(
          review.grade_composition_id,
          { _id: 1, name: 1 }
        ),
        studentStore.findStudentByStudentIdAndClassId(
          review.student_id,
          review.class_id,
          { student_id: 1, full_name: 1 }
        ),
        userStore.findUserByStudentId(review.student_id, { _id: 1 }),
      ]);

      review.class = {
        _id: reviewClass._id,
        class: reviewClass.class_name,
      };

      review.grade_composition = {
        _id: gradeComposition._id,
        name: gradeComposition.name,
      };

      review.student = {
        student_id: student.student_id,
        account_id: user._id,
        full_name: student.full_name,
      };

      res.status(200).send(simpleSuccessResponse(review, "Successfully!"));
    } catch (error) {
      res.status(500).send(errorInternalServer("Internal Server Error"));
    }
  };

  // [POST] /reviews
  createReview = async (req, res) => {
    const data = req.body;
    const userId = req.user.userId;

    if (
      !data ||
      !data.class_id ||
      !data.grade_composition_id ||
      !data.explanation ||
      !data.expectation_grade
    ) {
      return res
        .status(400)
        .send(errorBadRequest("Please provide a valid review data!"));
    }

    // find Student
    const student = await userStore.findUserById(userId);

    if (!student.student_id) {
      return res
        .status(403)
        .send(errNoPermission("You need update your student_id first!"));
    }

    // Check student is in class ???
    if (
      !(await classRegistrationStore.findByClassIdAndUserId(
        data.class_id,
        userId
      ))
    ) {
      return res
        .status(403)
        .send(
          errNoPermission(
            "You do not have permission to access (not in class)!"
          )
        );
    }

    // Check grade composition is finalized
    var checkGradeComposition =
      await gradeCompositionStore.findGradeCompositionById(
        data.grade_composition_id
      );

    if (!checkGradeComposition || checkGradeComposition.state != "Finalized") {
      return res
        .status(400)
        .send(errorBadRequest("Grade composition not valid or not finalized!"));
    }

    // Check is owner of grade
    var grade =
      await gradeStore.findGradeByStudentIdAndClassIdAndGradeCompositionId(
        student.student_id,
        data.class_id,
        data.grade_composition_id
      );

    if (!grade) {
      return res
        .status(403)
        .send(
          errNoPermission(
            "You do not have permission to access (not have grade)!"
          )
        );
    }

    data.state = "Pending";
    data.student_id = student.student_id;
    data.current_grade = grade.value;
    data.user_id = userId;
    data.grade_id = grade._id;
    data.comment_count = 0;

    if (
      await gradeReviewStore.getReviewByClassIdStudentIdAndGradeCompId(
        data.student_id,
        data.grade_composition_id,
        data.class_id
      )
    ) {
      return res
        .status(404)
        .send(errorCustom("You are already create review this grade!"));
    }

    const newReview = await gradeReviewStore.create(data);

    publishMessage("StudentCreateReview", newReview[0]);

    res.status(200).send(simpleSuccessResponse(data, "Successfully!"));
  };

  // [GET] /api/reviews/:id/comments
  getListComments = async (req, res) => {
    const id = req.params.id;

    let comments = await commentStore.findCommentsByReviewId(id);

    for (let comment of comments) {
      if (!comment.user_id) continue;

      var user = await userStore.findUserById(comment.user_id);
      if (!user) continue;
      comment.user = {
        _id: user._id,
        full_name: user.full_name,
        image: user.image || null,
      };
    }

    res.status(200).send(simpleSuccessResponse(comments, "Successfully!"));
  };

  // [POST] /api/reviews/:id/final-decision
  makeFinalDecision = async (req, res) => {
    const id = req.params.id;
    const body = req.body;

    if (!id || !body) {
      res.status(400).send(errorBadRequest("Invalid id!"));
    }

    let finalGrade = 0;
    const review = await gradeReviewStore.getReviewById(id);

    // check teacher is in class
    if (
      !(await classRegistrationStore.findByClassIdAndUserId(
        review.class_id,
        req.user.userId
      ))
    ) {
      return res
        .status(403)
        .send(errNoPermission("You do not have permission to access!"));
    }

    if (!body.new_grade) {
      finalGrade = review.current_grade;
    } else {
      finalGrade = body.new_grade;
    }
    gradeStore.updateById(review.grade_id, { value: finalGrade });
    gradeReviewStore.updateReviewDataById(id, {
      current_grade: finalGrade,
      state: "Finalized",
    });

    publishMessage("TeacherMakeFinalDecision", {
      review_id: id,
      final_grade: finalGrade,
      review_owner: review.user_id,
      class_id: review.class_id,
      user_id: req.user.userId,
      grade_composition_id: review.grade_composition_id,
    });

    res
      .status(200)
      .send(
        simpleSuccessResponse(
          { final_grade: finalGrade },
          "Successfully final review!"
        )
      );
  };

  // [POST] /api/reviews/:id/comments
  addCmt = async (req, res) => {
    const id = req.params.id;
    const body = req.body;

    if (!id || !body) {
      res.status(400).send(errorBadRequest("Invalid id!"));
    }

    const data = {
      type: "comment",
      user_id: req.user.userId,
      review_id: id,
      content: body.content,
    };

    commentStore.createNewComment(data);

    publishMessage("UserAddComment", {
      review_id: id,
      user_id: req.user.userId,
    });

    res
      .status(200)
      .send(simpleSuccessResponse(data, "Successfully final review!"));
  };
}

module.exports = new ReviewController();
