const mongoose = require('mongoose');
const { Schema } = mongoose;
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

var timer = new mongoose.Schema({
    last_scan_success: String,
    last_scan_failed: String,
    scan_success_count: Number,
    scan_failed_count: Number,
    failed_page_number_on: Number
}, { versionKey: false });

module.exports = mongoose.model('Timer', timer);