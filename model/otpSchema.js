const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const otpSchema = new Schema({
  email: {
    type: String,
  },
  username: {
    type: String,
  },
  phonenumber: {
    type: String,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
    required: true,
  },
});

const otp = mongoose.model("otp", otpSchema);
module.exports = otp;