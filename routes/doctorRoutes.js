const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { registerDoctor } = require("../controllers/doctorController");

router.post("/register", upload.single("qualificationDocs"), registerDoctor);
module.exports = router;