const Express = require("express");
const router = Express.Router();

const shortid = require("shortid");
const uuid = require("uuid");
const moment = require("moment");
const _ = require("lodash");
const rp = require("request-promise");
const PDFMerger = require("pdf-merger-js");

const rrad = require("rrad");
const Fakerator = require("fakerator");
const fakerator = Fakerator();
const util = require("util");

const {
  mapRequestToModel,
  responseClient,
  md5,
  MD5_SUFFIX,
} = require("./util");

//Here set your router

// router.get("/", (req, res) => {
//   responseClient(res, 200, 0, " Server is running well");
// });

// router.get("/welcome", (req, res) => {
//   responseClient(res, 200, 0, "Welcome to smartship beta api server.");
// });

router.post("/refund", (req, res) => {
  console.log(req.body); // Call your action on the request here
  res.status(200).end(); // Responding is important
});

module.exports = router;
