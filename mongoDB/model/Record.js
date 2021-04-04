const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
require("mongoose-double")(mongoose);
const moment = require("moment");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const beautifyUnique = require("mongoose-beautiful-unique-validation");
const { Schema } = mongoose;

var SchemaTypes = mongoose.Schema.Types;

//current use for IB refund/adjustment.
var record = new mongoose.Schema(
  {
    request_id: {
      type: String,
    },

    tracking_number: { type: String },

    type: { type: String },

    comment: { type: String },

    amount: { type: Number },

    amount_due: { type: Number },

    inform_at: {
      type: String,
      default: () => moment().format("YYYY-MM-DD HH:mm"),
    },

    label_create_at: {
      type: String,
    },
  },

  { versionKey: false }
);
record.plugin(mongoosePaginate);
// order.plugin(AutoIncrement, {
//     inc_field: 'order_counter',
//     start_seq: '00001',
//     inc_amount: 1
// });
// order.plugin(beautifyUnique);
// order.plugin(aggregatePaginate);
record.index({ "$**": "text" });
module.exports = mongoose.model("Record", record);
