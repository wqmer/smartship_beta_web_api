const mongoose = require("mongoose");
const moment = require("moment");
var Fakerator = require("fakerator");
var fakerator = Fakerator();
var name = fakerator.names.name();
const rrad = require("rrad");
const Pusher = require("pusher-js");
const util = require("util");
const Ib = require("./services/shipping_carrier/IB");
require("dotenv").config();
var parser = require("parse-address");
var numeral = require("numeral");
let imgConvert = require("image-convert");
const Record = require("./mongoDB/model/Record");
const {
  ACCESS_KEY_ID,
  SECRET_ACCESS_KEY,
  AWS_REGION,
  S3_BUCKET,
  testBase64,
  IBProdEndpoint,
  IBUsername,
  IBPassword,
} = process.env;

var Validator = require("jsonschema").Validator;
var v = new Validator();

var adjustmentSchema = {
  type: "object",
  properties: {
    adjustment: {
      type: "object",
      properties: {
        usps: {
          type: "object",
          properties: {
            tracking_number: { type: "string" },
            comment: { type: "string" },
            additional_postage_due: { type: "double" },
            recalculated_postage: { type: "double" },
          },
          required: [
            "tracking_number",
            "comment",
            "additional_postage_due",
            "recalculated_postage",
          ],
        },
      },
      required: ["usps"],
    },
  },
  required: ["type", "adjustment"],
};

var refundSchema = {
  type: "object",
  properties: {
    refund: {
      type: "object",
      properties: {
        usps: {
          type: "object",
          properties: {
            tracking_number: { type: "string" },
            comment: { type: "string" },
            amount: { type: "double" },
          },
          required: ["tracking_number", "comment", "amount"],
        },
      },
      required: ["usps"],
    },
  },
  required: ["type", "refund"],
};

var adjustmentExampleResponse = {
  version: "1.0",
  type: "adjustment_approved",
  adjustment: {
    usps: {
      tracking_number: "9205590188666700002431",
      // comment: "Weight Discrepancy",
      // additional_postage_due: 0.11,
      recalculated_postage: 7.13,
    },
  },
};

var refundExampleResponse = {
  version: "1.0",
  type: "refund_approved",
  refund: {
    carrier: "usps",
    usps: {
      tracking_number: "9205590188666700002431",
      amount: 7.02,
      comment: "Full refund approved.",
      created_at: "2020-10-10T12:54:52.469-07:00",
    },
  },
  mailpiece: {
    request_id: "XHA829122",
    weight: 1,
    pricing_weight: 1,
    pricing_cubic_ft: null,
    weight_unit: "lb",
    dimensions: null,
    dimensions_unit: null,
    value: 0,
    postmark_date: "2020-09-24T02:38:44.914-07:00",
    status: "refunded",
    postage_amount: 7.02,
    fees_amount: 0,
    total_amount: 7.02,
    estimated_delivery_days: 2,
    from_address: {
      first_name: "Jane",
      middle_name: null,
      last_name: "Wilson",
      company_name: "Redbrick247",
      line1: "247 High St",
      line2: null,
      line3: null,
      city: "PALO ALTO",
      state_province: "CA",
      postal_code: "94301",
      phone_number: "6503915169",
      email: "harry@redbrick247.com",
      sms: "SMS4440404",
      iso_country_code: "US",
    },
    to_address: {
      first_name: "John",
      middle_name: null,
      last_name: "Doe",
      company_name: "RedBrick247",
      line1: "4100 Orme St",
      line2: null,
      line3: null,
      city: "PALO ALTO",
      state_province: "CA",
      postal_code: "94306",
      phone_number: "8884445555",
      email: null,
      sms: null,
      iso_country_code: "US",
    },
    metadata: [],
    usps: {
      mail_class: "Priority",
      fees: [
        {
          name: "USPS Tracking",
          fee: 0,
        },
      ],
      pricing: "Commercial Base",
      zone: 1,
      country_group: null,
      canada_zone: null,
      tracking_numbers: ["9205590188666700002431"],
    },
    refund_detail: {
      amount: 7.02,
      comment: "Full refund approved.",
      created_at: "2020-10-10T12:54:52.469-07:00",
    },
    manifest_detail: null,
    carrier: "usps",
  },
};

const convertUTCtoLocal = (utc) => {
  var date = moment(utc).format("YYYY-MM-DD HH:mm:ss");
  var stillUtc = moment.utc(date).toDate();
  var local = moment(stillUtc).local().format("YYYY-MM-DD HH:mm");
  return local;
};

// v.addSchema(adjustmentSchema, "/adjustmentSchema");
// var res = v.validate(adjustmentExampleResponse, adjustmentSchema);
// console.log(res.valid);
// if(res.valid){
//    //do next
// }else {
//   console.log(res.errors.map(item => item.stack))
// }

// var res = v.validate(refundExampleResponse, refundSchema);
// if(res.valid){
//    //do next
// }else {
//   console.log(res.errors.map(item => item.stack))
// }

// console.log(account)
// let e = [
//   {
//     type: "test123",
//     request_id: "test123",
//     tracking_number: "test123",
//     amount: 99,
//     weight: 99,
//     zone: 99,
//     to_zipcode: "68803-test",
//     label_create_at: "2021-01-20T22:54:42.243-08:00",
//   },
// ];

// let test = async()=> {
//   let myResult = await Record.insertMany(e);
//   console.log(test)
// }

// test()

// myfun();

// LOCAL TO UTC

// console.log(moment('2021-04-22T01:00:00.05-07:00').isAfter('2021-04-22T01:00:00.05-07:00'))

// console.log(convertUTCtoLocal('2021-04-21T16:53:05.229-07:00'));

// console.log(convertUTCtoLocal('2021-04-22T01:00:00.05-07:00'));

// const TEST_STRING = '012345679'

// console.log(TEST_STRING[21] + TEST_STRING[20])

// const TEST = 123;

// const TRAIN = "A123";

// console.log(TRAIN.toLowerCase().contains('A'));




var parsed = parser.parseLocation('28 Windchase, STE D ,  Drive Beaumont, TX 77713');

console.log(parsed)