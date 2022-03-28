const express = require("express");
const router = express.Router();
const { checkoutController, checkPaymentController } = require("../controllers/checkout");

router.post("/", checkoutController);
router.post("/checkPaymentStatus", checkPaymentController);

module.exports = router;
