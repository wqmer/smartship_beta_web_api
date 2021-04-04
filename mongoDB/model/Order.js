const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
require("mongoose-double")(mongoose);
const moment = require("moment");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const beautifyUnique = require("mongoose-beautiful-unique-validation");
const { Schema } = mongoose;

var SchemaTypes = mongoose.Schema.Types;
var order = new mongoose.Schema(
  {
    order_id: {
      type: String,
      unique: "order_id must be unique !",
    },

    type: { type: String, default: "Domestic_ship" },
    status: { type: String, default: "draft" },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    created_at: {
      type: String,
      default: () => moment().format("YYYY-MM-DD HH:mm"),
    },
  },
  { versionKey: false }
);
order.plugin(mongoosePaginate);
// order.plugin(AutoIncrement, {
//     inc_field: 'order_counter',
//     start_seq: '00001',
//     inc_amount: 1
// });
// order.plugin(beautifyUnique);
// order.plugin(aggregatePaginate);
order.index({ "$**": "text" });
module.exports = mongoose.model("Order", order);
