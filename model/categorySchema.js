const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
      
    },
    subCategory:[{
        type:mongoose.Types.ObjectId,
        ref:'subCategories',
        required:true
    }],
    delete:{
        type:Boolean,
        default:false
    }


})

const categories = mongoose.model('categories',categorySchema);
module.exports = categories;