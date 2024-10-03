const express = require("express");
// const nguoiDungController = require('../controllers/userController');
const authController = require("../controllers/authController");

const router = express.Router();

// router.use(authController.protect);
// router.use(authController.restrictTo("Admin"));

router.post("/signup", authController.signup);
router.post("/login", authController.login);
// router.post('/forgotPassword', authController.forgotPassword);
router.get("/validateToken", authController.validateToken);
router.patch("/resetPassword", authController.resetPassword);

// router.route('/profile').get(nguoiDungController.getUser);

// router.route('/getUserProfile').get(nguoiDungController.getUserProfile);

// Protect all routes after this middleware

// router.get('/me', nguoiDungController.getMe, nguoiDungController.getUser);
// router.patch('/updateMyPassword', authController.updatePassword);
// router.patch('/updateMe', nguoiDungController.updateMe);
// router.delete('/deleteMe', nguoiDungController.deleteMe);

module.exports = router;
