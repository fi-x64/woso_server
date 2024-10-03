module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "roles",
    {
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      description: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "roles",
    }
  );
  return Role;
};
