const Express = require("express");
const router = Express.Router();

const shortid = require("shortid");
const uuid = require("uuid");
const moment = require("moment");
const _ = require("lodash");
const rp = require("request-promise");
const PDFMerger = require("pdf-merger-js");
const Record = require("../mongoDB/model/Record");
const Ib = require("../services/shipping_carrier/IB");

const rrad = require("rrad");
const Fakerator = require("fakerator");
const fakerator = Fakerator();
const util = require("util");
const controller  = require('../controller/index');

const {
  mapRequestToModel,
  responseClient,
  md5,
  MD5_SUFFIX,
} = require("./util");

//Here set your router

router.post("/refund", (req, res) => {
  // console.log(req.body); // Call your action on the request here
  let ib = new Ib();
  let result = ib.listernWebHook(req.body, "refund");
  if (result.code == 0) {
    let {
      request_id,
      tracking_number,
      refund_type,
      type,
      comment,
      amount,
      amount_due,
      label_create_at,
    } = result;

    let record = new Record({ ...result });

    // console.log(record);

    record
      .save()
      .then((result) => {
        console.log("Save data Successfully");
        res.status(200).end();
      })
      .catch((error) => {
        res.status(500).end();
        console.log(error);
      });
  } else {
    console.log(result);
    res.status(500).end(); // Responding is important
  }
});

router.post("/adjustment", (req, res) => {
  console.log(req.body); // Call your action on the request here
  res.status(200).end(); // Responding is important
});

router.post("/exportRefundAndAdjustment",controller.exportRecord)




module.exports = router;
