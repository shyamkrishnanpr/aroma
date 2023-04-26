const mongoose = require('mongoose');


const productSchema =  new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    brand:{
        type:String,
      
    },
    stock:{
        type:Number,
    
    },
    size:{
        type:String
    },
    image:[{
        path:String
    }],
    delete:{
        type:Boolean,
        default:false
    },
    category:{
        type:mongoose.Types.ObjectId,
        ref:'categories'
    },
    subCategory:{
        type:mongoose.Types.ObjectId,
        ref:'subCategories'
    },
},
{ timestamps: true }
)

const products = mongoose.model('products',productSchema);
module.exports =products;
