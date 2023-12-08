const Class = require("../models/class.model");
const mongooseHelper = require("../utils/mongoose.helper");

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
    var _class = mongooseHelper.mongoosesToObject(
      await Class.findOne({ _id: id })
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
}

module.exports = new ClassStore();
