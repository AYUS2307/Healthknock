const Appointment = require("../models/Appointment");

exports.bookAppointment = async (req, res) => {
    try {
        const { doctorId, date } = req.body;
        // Mocking User ID for now since we haven't implemented full Auth middleware extraction yet
        const userId = "654321dummyUserId"; 

        const newAppt = await Appointment.create({ userId, doctorId, date });
        res.json({ msg: "Appointment Booked", appointment: newAppt });
    } catch (error) {
        res.status(500).json({ msg: "Error booking", error });
    }
};