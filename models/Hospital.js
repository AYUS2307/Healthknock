const mongoose = require("mongoose");
const hospitalSchema = new mongoose.Schema({
    doctorsAvailable: { type: Number, default: 0 },
    bedsFree: { type: Number, default: 0 },
    icuUnits: { type: Number, default: 0 },
    rooms: [{
        roomNo: String,
        type: { type: String },
        status: { type: String, default: 'Available' },
        patientName: { type: String, default: '-' }
    }]
});
module.exports = mongoose.model("Hospital", hospitalSchema);