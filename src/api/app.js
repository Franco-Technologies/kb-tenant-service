const express = require("express");
const app = express();
const port = 3000;

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
