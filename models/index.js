const { Sequelize, DataTypes } = require("sequelize");

require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    operatorsAliases: 0,
    timezone: "+07:00",
  }
);

sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected..");
  })
  .catch((err) => {
    console.log("Error" + err);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.userModel = require("./userModel.js")(sequelize, DataTypes);
db.roleModel = require("./roleModel.js")(sequelize, DataTypes);
db.batchModel = require("./batchModel.js")(sequelize, DataTypes);

// db.validationDashboardPhase = require('./validation_dashboard_phase.js')(
//   sequelize,
//   DataTypes
// );

// db.sequelize
//   .sync({ force: false })
//   .then(() => {
//     console.log("yes re-sync done!");
//   })
//   .catch((err) => {
//     console.error("Error when sync:", err);
//   });

// 1 to Many Relation
// question - option
db.userModel.belongsTo(db.roleModel, {
  foreignKey: "role_id",
});

// db.roleModel.belongsTo(db.questionModel, {
//   foreignKey: "question_id",
// });

// // question - user_answer
// db.questionModel.hasMany(db.userAnswerModel, {
//   foreignKey: "question_id",
// });

// db.userAnswerModel.belongsTo(db.questionModel, {
//   foreignKey: "question_id",
// });

// // option - user_answer
// db.optionModel.hasMany(db.userAnswerModel, {
//   foreignKey: "option_id",
// });

// db.userAnswerModel.belongsTo(db.optionModel, {
//   foreignKey: "option_id",
// });

// // word - word_collection
// db.wordModel.hasMany(db.wordCollectionModel, {
//   foreignKey: "word_id",
// });

// db.wordCollectionModel.belongsTo(db.wordModel, {
//   foreignKey: "word_id",
// });

// // user - word_collection
// db.userAnswerModel.hasOne(db.wordCollectionModel, {
//   foreignKey: "user_answer_id",
// });

// db.wordCollectionModel.belongsTo(db.userAnswerModel, {
//   foreignKey: "user_answer_id",
// });

// // user - word_collection
// db.userModel.hasMany(db.wordCollectionModel, {
//   foreignKey: "user_id",
// });

// db.wordCollectionModel.belongsTo(db.userModel, {
//   foreignKey: "user_id",
// });

module.exports = db;
