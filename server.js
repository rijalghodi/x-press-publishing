const express = require("express");
const app = express();

// Import packages
const morgan = require("morgan");
const bodyParser = require("body-parser");
const errorHandler = require("errorhandler");
const cors = require("cors");
const apiRouter = require("./api/api");

// PORT
const PORT = process.env.PORT || 4000;

// Logging Middleware
app.use(morgan("dev"));

// Body parsing middleware
app.use(bodyParser.json());

app.use(cors());

// Error handler
app.use(errorHandler());

// API
app.use("/api", apiRouter);

// Listen to the port
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
