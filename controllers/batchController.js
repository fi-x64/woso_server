const db = require("../models");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const { Sequelize, Op } = require("sequelize");

const BatchCollection = db.batchModel;

exports.getBatch = catchAsync(async (req, res, next) => {
  const batchCode = req.params.batchCode;

  const batchData = await BatchCollection.findOne({
    where: {
      batch_code: { [Op.like]: `${batchCode}` },
    },
  });

  if (batchData) {
    return res.status(200).json({
      status: "success",
      data: batchData,
    });
  }

  return res.status(500).json({
    status: "error",
    data: "Get batch failed",
  });
});

exports.getAllBatch = catchAsync(async (req, res, next) => {
  let allBatchData;

  if (req.body.keyword) {
    const keyword = req.body.keyword;
    if (
      req.body.dateShipFilter.length > 0 &&
      req.body.dateExpFilter.length > 0
    ) {
      const dateShipFilter = req.body.dateShipFilter;
      const dateExpFilter = req.body.dateExpFilter;
      allBatchData = await BatchCollection.findAll({
        where: {
          [Op.and]: [
            {
              date_of_shipment: {
                [Op.between]: [dateShipFilter[0], dateShipFilter[1]],
              },
            },
            {
              expiration_date: {
                [Op.between]: [dateExpFilter[0], dateExpFilter[1]],
              },
            },
            {
              [Op.or]: [
                { batch_code: { [Op.like]: `%${keyword}%` } },
                { product_origin: { [Op.like]: `%${keyword}%` } },
                { country_of_destination: { [Op.like]: `%${keyword}%` } },
                { test_report_link_name: { [Op.like]: `%${keyword}%` } },
              ],
            },
          ],
        },
        order: [["id", "desc"]],
      });
    } else if (req.body.dateShipFilter.length > 0) {
      const dateShipFilter = req.body.dateShipFilter;
      allBatchData = await BatchCollection.findAll({
        where: {
          [Op.and]: [
            {
              date_of_shipment: {
                [Op.between]: [dateShipFilter[0], dateShipFilter[1]],
              },
            },
            {
              [Op.or]: [
                { batch_code: { [Op.like]: `%${keyword}%` } },
                { product_origin: { [Op.like]: `%${keyword}%` } },
                { country_of_destination: { [Op.like]: `%${keyword}%` } },
                { test_report_link_name: { [Op.like]: `%${keyword}%` } },
              ],
            },
          ],
        },
        order: [["id", "desc"]],
      });
    } else if (req.body.dateExpFilter.length > 0) {
      const dateExpFilter = req.body.dateExpFilter;
      allBatchData = await BatchCollection.findAll({
        where: {
          [Op.and]: [
            {
              expiration_date: {
                [Op.between]: [dateExpFilter[0], dateExpFilter[1]],
              },
            },
            {
              [Op.or]: [
                { batch_code: { [Op.like]: `%${keyword}%` } },
                { product_origin: { [Op.like]: `%${keyword}%` } },
                { country_of_destination: { [Op.like]: `%${keyword}%` } },
                { test_report_link_name: { [Op.like]: `%${keyword}%` } },
              ],
            },
          ],
        },
        order: [["id", "desc"]],
      });
    } else {
      allBatchData = await BatchCollection.findAll({
        where: {
          [Op.or]: [
            { batch_code: { [Op.like]: `%${keyword}%` } },
            { product_origin: { [Op.like]: `%${keyword}%` } },
            { country_of_destination: { [Op.like]: `%${keyword}%` } },
            { test_report_link_name: { [Op.like]: `%${keyword}%` } },
          ],
        },
        order: [["id", "desc"]],
      });
    }
  } else if (
    req.body.dateShipFilter.length > 0 &&
    req.body.dateExpFilter.length > 0
  ) {
    const dateShipFilter = req.body.dateShipFilter;
    const dateExpFilter = req.body.dateExpFilter;
    allBatchData = await BatchCollection.findAll({
      where: {
        [Op.and]: [
          {
            date_of_shipment: {
              [Op.between]: [dateShipFilter[0], dateShipFilter[1]],
            },
          },
          {
            expiration_date: {
              [Op.between]: [dateExpFilter[0], dateExpFilter[1]],
            },
          },
        ],
      },
      order: [["id", "desc"]],
    });
  } else if (req.body.dateShipFilter.length > 0) {
    const dateShipFilter = req.body.dateShipFilter;
    allBatchData = await BatchCollection.findAll({
      where: {
        date_of_shipment: {
          [Op.between]: [dateShipFilter[0], dateShipFilter[1]],
        },
      },
      order: [["id", "desc"]],
    });
  } else if (req.body.dateExpFilter.length > 0) {
    const dateExpFilter = req.body.dateExpFilter;
    allBatchData = await BatchCollection.findAll({
      where: {
        expiration_date: {
          [Op.between]: [dateExpFilter[0], dateExpFilter[1]],
        },
      },
      order: [["id", "desc"]],
    });
  } else
    allBatchData = await BatchCollection.findAll({ order: [["id", "desc"]] });

  if (allBatchData) {
    return res.status(200).json({
      status: "success",
      data: allBatchData,
    });
  }

  return res.status(500).json({
    status: "error",
    data: "Get all batch failed",
  });
});

exports.createBatch = catchAsync(async (req, res, next) => {
  const data = req.body;

  var queryResult;
  const batchData = await BatchCollection.findOne({
    where: {
      batch_code: data.batchCode,
    },
  });

  if (!batchData) {
    const newBatch = new BatchCollection({
      batch_code: data.batchCode,
      product_origin: data.productOrigin,
      country_of_destination: data.countryOfDestination,
      date_of_shipment: data.dateOfShipment,
      expiration_date: data.expirationDate,
      test_report_link_name: data.testReportLinkName,
      test_report: data.testReport,
    });

    queryResult = await newBatch.save();
  }

  if (queryResult) {
    res.status(200).json({
      status: "success",
      data: `Created batch ${data.batchCode} successfully`,
    });
  } else {
    if (batchData) {
      res.status(200).json({
        status: "error",
        data: `Batch ${data.batchCode} already exists`,
      });
    } else {
      res.status(500).json({
        status: "error",
        data: `Create batch ${data.batchCode} failed`,
      });
    }
  }
});

exports.editBatch = catchAsync(async (req, res, next) => {
  const data = req.body;

  var queryResult;
  let batchData = await BatchCollection.findOne({
    where: {
      batch_code: data.prevBatchCode,
    },
  });

  if (batchData) {
    queryResult = await batchData.update({
      ...batchData.dataValues,
      batch_code: data.batchCode,
      product_origin: data.productOrigin,
      country_of_destination: data.countryOfDestination,
      date_of_shipment: data.dateOfShipment,
      expiration_date: data.expirationDate,
      test_report_link_name: data.testReportLinkName,
      test_report: data.testReport,
    });
  } else {
    return res.status(500).json({
      status: "error",
      data: `Batch ${data.batchCode} not exists`,
    });
  }

  if (queryResult) {
    res.status(200).json({
      status: "success",
      data: `Edit batch ${data.batchCode} successfully`,
    });
  } else {
    res.status(500).json({
      status: "error",
      data: `Edit batch ${data.batchCode} failed`,
    });
  }
});

exports.deleteBatch = catchAsync(async (req, res, next) => {
  const data = req.params;

  var queryResult = await BatchCollection.destroy({
    where: {
      batch_code: data.batchCode,
    },
  });

  if (queryResult) {
    res.status(200).json({
      status: "success",
      data: `Delete batch ${data.batchCode} successfully`,
    });
  } else {
    res.status(500).json({
      status: "error",
      data: `Delete batch ${data.batchCode} failed`,
    });
  }
});
