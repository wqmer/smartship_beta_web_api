const { MIME_TIFF } = require("jimp");

var Validator = require("jsonschema").Validator;

const adjustmentSchema = {
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
    mailpiece: {
      type: "object",
      properties: {
        request_id: { type: "string" },
      },
      required: ["request_id"],
    },
  },
  required: ["type", "adjustment"],
};

const refundSchema = {
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
    mailpiece: {
      type: "object",
      properties: {
        request_id: { type: "string" },
        postmark_date: { type: "string" },
      },
      required: ["request_id", "postmark_date"],
    },
  },
  required: ["type", "refund", "mailpiece"],
};

class InternationalBridge {
  constructor(account, apiEndPoint, discount, carrier, mailClass, asset = {}) {
    this.account = account;
    this.apiEndPoint = apiEndPoint;
    this.dicount = discount;
    this.carrier = carrier;
    this.mailClass = mailClass;
    this.asset = asset;
  }

  listernWebHook = function (request_body, type = "refund") {
    var v = new Validator();
    let responseFormat = {};

    if (type == "adjustment") {
      responseFomat = {};
      return;
    }

    let isValidate = v.validate(request_body, refundSchema);

    if (isValidate) {
      responseFormat = {
        code: 0,
        request_id: request_body.mailpiece.request_id,
        tracking_number: request_body.refund.usps.tracking_number,
        type: request_body.type,
        comment: request_body.refund.usps.comment,
        amount: request_body.refund.usps.amount,
        label_create_at: request_body.mailpiece.postmark_date,
      };
      console.log(responseFormat);
    } else {
      responseFormat = {
        code: 1,
        errorMessage: isValidate.errors.map((item) => item.stack),
      };
    }

    return responseFormat;

    // var Validator = require("jsonschema").Validator;
    // var v = new Validator();
  };

  // void = () => {

  // }

  // track = () => {

  // }

  // verify = () => {

  // }
}

module.exports = InternationalBridge;
