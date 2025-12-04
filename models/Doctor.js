const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    specialization: String,
    qualificationDocs: String,
    licenseNumber: String,
    isVerified: { type: Boolean, default: false }
});
module.exports = mongoose.model("Doctor", doctorSchema);