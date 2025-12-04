const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    date: String,
    status: { type: String, default: "pending" }
});
module.exports = mongoose.model("Appointment", appointmentSchema);