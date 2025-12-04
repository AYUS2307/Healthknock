const express = require("express");
const router = express.Router();
const { predictDisease } = require("../controllers/aiController");
router.post("/predict", predictDisease);
module.exports = router;