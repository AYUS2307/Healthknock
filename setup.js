const fs = require('fs');
const path = require('path');

// Define the folder structure
const folders = [
    'config',
    'models',
    'routes',
    'controllers',
    'public',
    'uploads' // Added this because doctorRoutes uses it
];

// Define the file contents
const files = {
    'package.json': JSON.stringify({
        "name": "health-ai-project",
        "version": "1.0.0",
        "main": "server.js",
        "scripts": {
            "start": "node server.js",
            "dev": "nodemon server.js"
        },
        "dependencies": {
            "@google/generative-ai": "^0.1.3",
            "bcryptjs": "^2.4.3",
            "cors": "^2.8.5",
            "dotenv": "^16.3.1",
            "express": "^4.18.2",
            "jsonwebtoken": "^9.0.2",
            "mongoose": "^7.6.3",
            "multer": "^1.4.5-lts.1"
        },
        "devDependencies": {
            "nodemon": "^3.0.1"
        }
    }, null, 2),

    '.env': `MONGO_URI=mongodb://127.0.0.1:27017/healthDB
JWT_SECRET=sachin_secret_key_123
GEMINI_API_KEY=PASTE_YOUR_GEMINI_API_KEY_HERE
PORT=5000`,

    'server.js': `const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const path = require("path");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/doctors", require("./routes/doctorRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));
app.use("/api/ai", require("./routes/aiRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));`,

    'config/db.js': `const mongoose = require("mongoose");
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.log("DB Connection Error:", error);
        process.exit(1);
    }
};
module.exports = connectDB;`,

    'models/User.js': `const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "admin"], default: "patient" }
});
module.exports = mongoose.model("User", userSchema);`,

    'models/Doctor.js': `const mongoose = require("mongoose");
const doctorSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    specialization: String,
    qualificationDocs: String,
    licenseNumber: String,
    isVerified: { type: Boolean, default: false }
});
module.exports = mongoose.model("Doctor", doctorSchema);`,

    'models/Appointment.js': `const mongoose = require("mongoose");
const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
    date: String,
    status: { type: String, default: "pending" }
});
module.exports = mongoose.model("Appointment", appointmentSchema);`,

    'models/Hospital.js': `const mongoose = require("mongoose");
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
module.exports = mongoose.model("Hospital", hospitalSchema);`,

    'controllers/authController.js': `const User = require("../models/User");
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
};`,

    'controllers/aiController.js': `const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

// Initialize Gemini
// WARNING: Ensure GEMINI_API_KEY is in your .env file
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

exports.predictDisease = async (req, res) => {
    try {
        if (!genAI) return res.status(500).json({ reply: "API Key missing in server." });
        
        const { message } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = \`User complains of: "\${message}". Act as a doctor. 
        1. List 3 possible causes. 
        2. Suggest home remedies. 
        3. Advise seeing a doctor if serious. Keep it brief.\`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("AI Error:", error);
        res.status(500).json({ reply: "I am having trouble thinking right now. Please try again." });
    }
};`,

    'controllers/appointmentController.js': `const Appointment = require("../models/Appointment");

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
};`,

    'controllers/doctorController.js': `const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");

exports.registerDoctor = async (req, res) => {
    try {
        const { name, email, password, specialization, licenseNumber } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const doctor = await Doctor.create({
            name, email, password: hashedPassword, specialization, licenseNumber,
            qualificationDocs: req.file ? req.file.filename : ""
        });
        res.json({ msg: "Doctor registered", doctor });
    } catch (error) {
        res.status(500).json(error);
    }
};`,

    'routes/authRoutes.js': `const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
router.post("/register", register);
router.post("/login", login);
module.exports = router;`,

    'routes/doctorRoutes.js': `const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const { registerDoctor } = require("../controllers/doctorController");

router.post("/register", upload.single("qualificationDocs"), registerDoctor);
module.exports = router;`,

    'routes/appointmentRoutes.js': `const express = require("express");
const router = express.Router();
const { bookAppointment } = require("../controllers/appointmentController");
router.post("/book", bookAppointment);
module.exports = router;`,

    'routes/aiRoutes.js': `const express = require("express");
const router = express.Router();
const { predictDisease } = require("../controllers/aiController");
router.post("/predict", predictDisease);
module.exports = router;`,

    'public/script.js': `// GLOBAL JS
window.onload = () => {
    if(typeof gsap !== 'undefined') gsap.from("body", { opacity: 0, duration: 1.2 });
};

function goTo(page) {
    window.location.href = page;
}

// LOGIN LOGIC
async function loginUser() {
    const email = document.querySelector('input[type="text"]').value;
    const password = document.querySelector('input[type="password"]').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role: 'patient' })
        });
        const data = await res.json();
        
        if (res.ok) {
            localStorage.setItem('token', data.token);
            window.location.href = "dashboard.html";
        } else {
            alert(data.msg || "Login failed");
        }
    } catch (e) {
        console.error(e);
        alert("Server error");
    }
}

// AI CHAT LOGIC
async function sendMessage() {
    const input = document.getElementById("userInput");
    const text = input.value;
    if (!text) return;

    addChatMessage("user", text);
    input.value = "";
    addChatMessage("bot", "Thinking...", "loading");

    try {
        const res = await fetch("/api/ai/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });
        const data = await res.json();
        
        const loader = document.querySelector(".loading");
        if(loader) loader.remove();
        
        addChatMessage("bot", data.reply.replace(/\\n/g, "<br>"));
    } catch (err) {
        console.error(err);
    }
}

function addChatMessage(sender, text, extraClass = "") {
    const box = document.getElementById("messages");
    if(!box) return;
    const div = document.createElement("div");
    div.classList.add("message", sender);
    if(extraClass) div.classList.add(extraClass);
    div.innerHTML = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}
`
};

// Create Folders
folders.forEach(dir => {
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created folder: ${dir}`);
    }
});

// Create Files
Object.keys(files).forEach(fileName => {
    const filePath = path.join(__dirname, fileName);
    fs.writeFileSync(filePath, files[fileName]);
    console.log(`Created file: ${fileName}`);
});

console.log("\n✅ Project Structure Created Successfully!");
console.log("👉 ACTION REQUIRED: Move your existing HTML/CSS files into the 'public' folder.");
console.log("👉 ACTION REQUIRED: Run 'npm install' to install dependencies.");
console.log("👉 ACTION REQUIRED: Add your GEMINI_API_KEY to the .env file.");