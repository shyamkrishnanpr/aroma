const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userVerificationSchema = new Schema({
    userId:String,
    uniqueString:String,
    createdAt:Date,
    expiresAt:Date,
    
});

const userVerification = mongoose.model('userVerification',userVerificationSchema)

module.exports = userVerification;
