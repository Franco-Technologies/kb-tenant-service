const express = require("express");
const app = express();
const port = 3000;

// Middleware to log every request
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to strip the base path
app.use((req, res, next) => {
  if (req.url.startsWith("/tenant-management")) {
    req.url = req.url.replace("/tenant-management", "");
  }
  next();
});

app.get("/", (req, res) => {
  console.log("Hello World!!");
  res.send("Hello World!!");
});

app.get("/api", (req, res) => {
  console.log("API");
  res.json({ message: "s" });
});

app.listen(port, () => {
  console.log(`API listening at http://localhost:${port}`);
});
