const Razorpay = require('razorpay');
const dotenv = require('dotenv');
dotenv.config();

const  instance = new Razorpay({
    key_id: process.env.key_id,
    key_secret: process.env.key_secret,
  });

module.exports=instance;

