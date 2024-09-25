const express = require("express");
const pointsRoutes = require("./routes/points.js");

const PORT = 8000;

app = express(); // express instance

app.use(express.json()); // middleware allowing automatic JSON request body parsing

app.use("/", pointsRoutes);

// server instance listening to port 8000 on localhost
const server = app.listen(PORT, () =>
  console.log(`Server running on port: http://localhost:${PORT}`)
);

module.exports = server;
