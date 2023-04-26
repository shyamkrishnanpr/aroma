const { text } = require('body-parser');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const orderSchema = new Schema({
    userId :{
        type:ObjectId
    },
    username:{
        type:String
    },
    phonenumber:{
        type:String
    },
    housename:{
        type:String
    },
    postoffice:{
        type:String
    },
    area:{
        type:String
    },
    district:{
        type:String
    },
    state:{
        type:String
    },
    pin:{
        type:String     
    },
    orderItems:[{
        productId:{
            type:ObjectId
        },
        quantity:{
            type:Number
        }
    }],
    totalAmount:{
        type:Number
    },
    orderStatus:{
        type:String,
        default:"Pending"
    },
    paymentMethod:{
        type:String
    },
    paymentStatus:{
        type:String
    },
    orderDate:{
        type:String
    },
    deliveryDate:{
        type:String
    },
},
{ timestamps: true }
);

const orders = mongoose.model("orders",orderSchema);
module.exports = orders;