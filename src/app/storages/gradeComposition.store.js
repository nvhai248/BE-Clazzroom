const GradeComposition = require("../models/gradeComposition.model");
const mongooseHelper = require("../utils/mongoose.helper");

class GradeCompositionStore {
  createGradeCompositionWithSession = async (gradeCompositionData, session) => {
    const nameIsExisted = await GradeComposition.findOne({
      class_id: gradeCompositionData.class_id,
      name: gradeCompositionData.name,
    });

    if (nameIsExisted) {
      throw new Error("Grade composition with the same name already exists.");
    }

    await GradeComposition.create([gradeCompositionData], { session });
  };

  updateGradeCompositionWithSession = async (
    id,
    gradeCompositionData,
    session
  ) => {
    await GradeComposition.updateOne({ _id: id }, gradeCompositionData, {
      session,
    });
  };

  findGradeCompositionById = async (id) => {
    return mongooseHelper.mongoosesToObject(
      await GradeComposition.findOne({ _id: id })
    );
  };

  deleteGradeComposition = async (id) => {
    await GradeComposition.deleteOne({ _id: id });
  };

  findGradeCompositionsByClassId = async (classId) => {
    return mongooseHelper.multiMongooseToObject(
      await GradeComposition.find({ class_id: classId }).sort({ order: 1 })
    );
  };
}

module.exports = new GradeCompositionStore();
