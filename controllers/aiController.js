const Groq = require("groq-sdk");
require("dotenv").config();

// TEMPORARY FIX: Paste key directly here to test

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });


exports.predictDisease = async (req, res) => {
    try {
        // Debugging: Print to terminal to prove key is loaded
        if (!process.env.GROQ_API_KEY) {
            console.log("CRITICAL: GROQ_API_KEY is missing in .env!");
            return res.status(500).json({ reply: "Server Config Error: Missing API Key" });
        }

        const { message } = req.body;

        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful medical assistant. Analyze symptoms and suggest causes and remedies. Keep it brief."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            // Use this model (it is free and very fast)
            model: "llama-3.3-70b-versatile", 
        });

        const botReply = completion.choices[0]?.message?.content || "No response.";
        res.json({ reply: botReply });

    } catch (error) {
        console.error("Groq Error:", error);
        res.status(500).json({ reply: "I am unable to think right now. Please check the server console." });
    }
};