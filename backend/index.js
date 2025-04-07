const express = require("express");
const cors = require("cors");
const routes = require("./routes");

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(cors({ origin: FRONTEND_URL }));

app.use(express.json());
app.use('', routes);

module.exports = app;
