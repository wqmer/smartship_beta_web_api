const { MIME_TIFF } = require("jimp");
const axios = require("axios");
const moment = require("moment");
var Validator = require("jsonschema").Validator;

const DEFAULT_DATA_SCHEME = function (data) {
  return data;
};

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
        type: {
          type: "string",
        },
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
      required: ["type", "usps"],
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

const labelSchema = {
  type: "object",
  properties: {
    request_id: { type: "string" },
    weight: { type: "number" },
    postmark_date: { type: "string" },
    total_amount: { type: "number" },
    to_address: {
      type: "object",
      properties: {
        postal_code: { type: "string" },
        required: ["postal_code"],
      },
    },
    usps: {
      type: "object",
      properties: {
        zone: { type: "number" },
        tracking_numbers: { type: "array", items: { type: "string" } },
        required: ["zone", "tracking_numbers"],
      },
    },

    required: [
      "type",
      "usps",
      "postmark_date",
      "total_amount",
      "to_address",
      "usps",
    ],
  },
};

const convertUTCtoLocal = (utc) => {
  var date = moment(utc).format("YYYY-MM-DD HH:mm:ss");
  var stillUtc = moment.utc(date).toDate();
  var local = moment(stillUtc).local().format("YYYY-MM-DD HH:mm");
  return local;
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

  responseMapToResult(response, dataScheme = DEFAULT_DATA_SCHEME) {
    let result;
    if (!response)
      return {
        code: 1,
        message: "No resopnse from remote server ",
      };

    let data = response.data;
    switch (response.status) {
      case 200:
        result = {
          status: response.status,
          code: 0,
          message: "Process request sucessfully",
          data: dataScheme(data),
        };
        break;
      default:
        result = {
          status: response.status,
          code: 1,
          message: response.data.message,
        };
    }

    return result;
  }

  listernWebHook(request_body, type = "refund") {
    var v = new Validator();
    let responseFormat = {};

    //todo ajdustment
    if (type == "adjustment") {
      responseFomat = {};
      return;
    }

    //should validate the rquest_body Json
    let isValidate = v.validate(request_body, refundSchema);

    if (isValidate) {
      responseFormat = {
        code: 0,
        request_id: request_body.mailpiece.request_id,
        tracking_number: request_body.refund.usps.tracking_number,
        type: request_body.type,
        refund_type: request_body.refund.type,
        comment: request_body.refund.usps.comment,
        amount: request_body.refund.usps.amount,
        label_create_at: request_body.mailpiece.postmark_date,
      };
      // console.log(responseFormat);
    } else {
      responseFormat = {
        code: 1,
        errorMessage: isValidate.errors.map((item) => item.stack),
      };
    }

    return responseFormat;

    // var Validator = require("jsonschema").Validator;
    // var v = new Validator();
  }

  async index(params, url = "/labels") {
    try {
      // console.log(shipment)
      let response = await axios({
        method: "get",
        params,
        url: this.apiEndPoint + url,
        auth: { ...this.account },
      });

      // console.log(response.status);
      if (!response)
        return {
          code: 1,
          message: "No resopnse from remote server ",
        };

      return response.status == 200
        ? {
            code: 0,
            data: response.data.map((item) => {
              let dataFomat = {
                type: "label",
                request_id: item.request_id,
                tracking_number: item.usps.tracking_numbers[0],
                amount: item.total_amount,
                weight: item.weight,
                zone: item.usps.zone,
                inform_at: convertUTCtoLocal(item.postmark_date),
                to_zipcode: item.to_address.postal_code,
                label_create_at: item.postmark_date,
              };
              return dataFomat;
            }),
          }
        : { code: 1, data: [] };
      // return ResponseWithoutHeader
    } catch (error) {
      return {
        code: error.response.status == 404 ? 0 : 1,
        data: [],
      };
    }
  }

  async validateAddress(request_body, url = "/address/validate") {
    try {
      let response = await axios({
        method: "post",
        data: request_body,
        url: this.apiEndPoint + url,
        auth: { ...this.account },
      });

      // console.log(response);

      return this.responseMapToResult(response);
    } catch (error) {
      // console.log(error);
      return this.responseMapToResult(error.response);
    }
  }

  async getMatchedAddress(request_body, url = "/address/resolve_multiple") {
    try {
      let response = await axios({
        method: "post",
        data: request_body,
        url: this.apiEndPoint + url,
        auth: { ...this.account },
      });
      return this.responseMapToResult(response);
    } catch (error) {
      // console.log(error);
      return this.responseMapToResult(error.response);
    }
  }

  async getCity(params, url = "/address/city") {
    try {
      let response = await axios({
        method: "get",
        params,
        url: this.apiEndPoint + url,
        auth: { ...this.account },
      });
      return this.responseMapToResult(response);
    } catch (error) {
      // console.log(error);
      return this.responseMapToResult(error.response);
    }
  }

  // void = () => {

  // }

  // track = () => {

  // }

  // verify = () => {

  // }
}

module.exports = InternationalBridge;
