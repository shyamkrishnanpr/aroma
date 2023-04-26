const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config();

mongoose.set('strictQuery',true)
module.exports = {
    dbconnect:()=>{
         mongoose.connect(process.env.MONG_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
         })
        .then(()=>{
            console.log("Database connected successfully")
         })
         .catch((err)=>console.log("error"+err));
    }
};