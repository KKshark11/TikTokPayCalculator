const express = require("express");
const path = require("path");

const app = express();

const root = path.join(__dirname);

// Serve static files (HTML, CSS, JS, XML, etc.)
app.use(express.static(root));

// Explicitly serve sitemap and robots if needed
app.get("/sitemap.xml", (req, res) => {
    res.sendFile(path.join(root, "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
    res.sendFile(path.join(root, "robots.txt"));
});

// Fallback: only send index.html for unknown routes
app.get("*", (req, res) => {
    res.sendFile(path.join(root, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server running on port " + PORT);
});