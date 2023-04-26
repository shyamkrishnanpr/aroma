const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const bannerSchema = new Schema({
    offerType:{
        type:String,
        required:true
    },
    bannerText:{
        type:String,
        required:true
    },
    couponName:{
        type:String,
        required:true
    },
    bannerImage:{
        type:String,
        required:true
    },
    blocked:{
        type:Boolean,
        default:false
    },
    order:{
        type:Number,
        default:0
    }

},
    {
        timestamps:true
    }

  
);

const banner = mongoose.model("banner",bannerSchema)
module.exports = banner;