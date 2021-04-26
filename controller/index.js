const Record = require("../mongoDB/model/Record");
const Timer = require("../mongoDB/model/Timer");
const _ = require("lodash");
const moment = require("moment");
require("dotenv").config();
const Ib = require("../services/shipping_carrier/IB");
const {
  mapRequestToModel,
  responseClient,
  md5,
  MD5_SUFFIX,
} = require("./util");

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

const exportRecord = async (req, res) => {
  try {
    let result = await Record.find(req.body.query, req.body.select);
    responseClient(res, 200, 0, "Query successfully", result);
  } catch (error) {
    responseClient(res);
  }
};

const testInsert = async (req, res) => {
  try {
    let myResult = await Record.insertMany(e);
    responseClient(res, 200, 0, "Insert successfully", myResult);
  } catch (error) {
    responseClient(res);
  }
};

const scanAndSave = async (
  start_date,
  end_date,
  page_size,
  page_number = 1
) => {
  let param = {
    start_date, //"2021-01-19T20:08:35.829-07:00",
    end_date, //"2021-01-20T15:12:57-07:00",
    page_size, // 500,
    //status:refunded
    page_number,
  };

  let account = {
    username: IBUsername,
    password: IBPassword,
  };

  let ib = new Ib({ ...account }, IBProdEndpoint);

  try {
    while (true) {
      let result = await ib.index(param);
      if (result.code == 0) {
        if (result.data.length != 0) {
          let myResult = await Record.insertMany(result.data);
          console.log(
            "Save " +
              result.data.length +
              " records  successfully , from " +
              start_date +
              " to " +
              end_date +
              " on pageNumber : " +
              param.page_number
          );
          param.page_number++;
        } else {
          //finished !
          break;
        }
      } else {
        console.log(
          "Error happen in " +
            start_date +
            " to " +
            end_date +
            " at page_number : " +
            param.page_number
        );
        return param.page_number;
      }
    }
  } catch (error) {
    console.log("error happend from catch blog");
    return -1;
  }
  console.log(
    "Save all data successfully , from " +
      start_date +
      " to " +
      end_date +
      " for total pages : " +
      param.page_number
  );
  return 0;
};

const addressValidate = async (req, res) => {
  try {
    let account = {
      username: IBUsername,
      password: IBPassword,
    };
    let ib = new Ib({ ...account }, IBProdEndpoint);
    let result = await ib.validateAddress(req.body);
    let city = result.data ? result.data.city : req.city;
    responseClient(res, result.status, result.code, result.message, {
      address_info: result.data ? result.data : {},
      address_match: req.addressMatched &&  req.addressMatched.length >0
        ? req.addressMatched.map((item) => {
            return { ...item, city };
          })
        : [],
    });
  } catch (error) {
    console.log(error);
    responseClient(res);
  }
};

//middleware
const getMatchedAddress = async (req, res, next) => {
  try {
    let account = {
      username: IBUsername,
      password: IBPassword,
    };
    let ib = new Ib({ ...account }, IBProdEndpoint);
    let result = await ib.getMatchedAddress(req.body);

    req.addressMatched = result.data;
    next();
    // responseClient(
    //   res,
    //   result.status,
    //   result.code,
    //   result.message,
    //   result.data
    // );
  } catch (error) {
    console.log(error);
    req.addressMatched = [];
    next();
    // responseClient(res);
  }

  // try {
  //   let account = {
  //     username: IBUsername,
  //     password: IBPassword,
  //   };
  //   let ib = new Ib({ ...account }, IBProdEndpoint);
  //   let result = await ib.getMatchedAddress(req.body);

  //   responseClient(
  //     res,
  //     result.status,
  //     result.code,
  //     result.message,
  //     result.data
  //   );
  // } catch (error) {
  //   console.log(error)
  //   responseClient(res);
  // }
};

//middleware
const getCity = async (req, res, next) => {
  try {
    let account = {
      username: IBUsername,
      password: IBPassword,
    };
    let ib = new Ib({ ...account }, IBProdEndpoint);
    let result = await ib.getCity({ zip5: req.body.postal_code });
    if (!result.data || result.data.length == 0) {
      req.city = undefined;
    }
    req.city = result.data[0].city_name;
    next();
  } catch (error) {
    console.log(error);
    req.city = undefined;
    next();
  }
};

module.exports = {
  exportRecord,
  testInsert,
  scanAndSave,
  addressValidate,
  getMatchedAddress,
  getCity,
};
