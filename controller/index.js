const Record = require("../mongoDB/model/Record");
const _ = require("lodash");
const moment = require("moment");


const {
  mapRequestToModel,
  responseClient,
  md5,
  MD5_SUFFIX,
} = require("./util");

let exportRecord = async (req, res) => {
  try {
    let result = await Record.find(req.body.query , req.body.select)
    responseClient(res, 200, 0, "Quary successfully", result);
  } catch (error) {
    responseClient(res);
  }
};


module.exports = {
    exportRecord
  };
  