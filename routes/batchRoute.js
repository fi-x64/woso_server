const express = require("express");
// const nguoiDungController = require('../controllers/userController');
const batchController = require("../controllers/batchController");

const router = express.Router();

router.get("/getBatch/:batchCode", batchController.getBatch);

router.post("/getAllBatch", batchController.getAllBatch);

router.post("/createBatch", batchController.createBatch);

router.post("/editBatch", batchController.editBatch);

router.delete("/deleteBatch/:batchCode", batchController.deleteBatch);

module.exports = router;
