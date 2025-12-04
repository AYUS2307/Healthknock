const User = require("../models/User");
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, role });
        res.json({ msg: "Registration successful", user });
    } catch (err) {
        res.status(500).json(err);
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        const model = role === "doctor" ? Doctor : User;
        const user = await model.findOne({ email });
        if (!user) return res.status(400).json({ msg: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ msg: "Invalid credentials" });

        const token = jwt.sign({ user: { id: user._id, role: user.role } }, process.env.JWT_SECRET);
        res.json({ msg: "Login successful", token });
    } catch (err) {
        res.status(500).json(err);
    }
};