// const functions = require("firebase-functions");
const admin = require("./firebase");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const { logger } = require("./logs");

const routes = require("./config/routes");

const port = process.env.PORT || 80;

routes(app);

app.get("/", (req, res) => {
  const test = req.query.name;
  logger.info("hello %s", test);
  res.send(`Hello ${test}`);
});

app.listen(port, () => {
  logger.info("Server On %s", port);
});
