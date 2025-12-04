// GLOBAL JS
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
        
        addChatMessage("bot", data.reply.replace(/\n/g, "<br>"));
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
