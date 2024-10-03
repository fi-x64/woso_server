module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "users",
    {
      username: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      role_id: {
        allowNull: false,
        type: DataTypes.NUMBER,
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "users",
    }
  );
  return User;
};
