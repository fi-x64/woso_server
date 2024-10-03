module.exports = (sequelize, DataTypes) => {
  const Batch = sequelize.define(
    "batchs",
    {
      batch_code: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      product_origin: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      country_of_destination: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      date_of_shipment: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      expiration_date: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      test_report: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      test_report_link_name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      tableName: "batchs",
    }
  );
  return Batch;
};
