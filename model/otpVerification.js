const mongoose = require('mongoose');
const Schema = mongoose.Schema

const OtpSchema = new Schema({
    userId:{
        type:String
    },
    otp:{
        type:String
    },
    createdAt : Date,
    expiresAt : Date,
});

const userOtp = mongoose.model("userOtp",OtpSchema);

module.exports = userOtp;

