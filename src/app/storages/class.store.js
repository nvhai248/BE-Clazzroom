const Class = require("../models/class.model");
const mongooseHelper = require("../utils/mongoose.helper");
const { errorCustom } = require("../views/error");

class ClassStore {
  findListClassById = async (ids) => {
    var classes = [];

    for (let i = 0; i < ids.length; i++) {
      classes.push(
        mongooseHelper.mongoosesToObject(await Class.findOne({ _id: ids[i] }))
      );
    }

    return classes;
  };

  findClassById = async (id) => {
    try {
      var _class = mongooseHelper.mongoosesToObject(
        await Class.findOne({ _id: id })
      );
      return _class;
    } catch (error) {
      return null;
    }
  };

  findClassByClassCode = async (class_code) => {
    var _class = mongooseHelper.mongoosesToObject(
      await Class.findOne({ class_code: class_code })
    );
    return _class;
  };

  createClass = async (classInfo) => {
    var newClass = new Class(classInfo);
    await newClass.save();

    return newClass;
  };

  updateClass = async (id, newClassInfo) => {
    await Class.updateOne({ _id: id }, newClassInfo);
  };

  increaseStudentCount = async (id) => {
    await Class.updateOne({ _id: id }, { $inc: { student_count: 1 } });
  };

  increaseTeacherCount = async (id) => {
    await Class.updateOne({ _id: id }, { $inc: { teacher_count: 1 } });
  };
}

module.exports = new ClassStore();
