const mongoose = require('mongoose')

const subCategorySchema = new mongoose.Schema({
     name:{
        type:String,
        required:true
     },
     delete:{
        type:Boolean,
        default:false
     }
});

const subCategories = mongoose.model('subCategories',subCategorySchema);

module.exports = subCategories;