const categories = require('../model/categorySchema');
const subCategories = require('../model/subCategorySchema')
const mongoose = require('mongoose');



//Category management

const getCategory = async (req, res, next) => {
    try {
        const category = await categories.find();
        const subCategory= await subCategories.find();

        res.render('admin/category', { category,subCategory });
    } catch (err) {
        console.log(err)
    }
};


const addCategory = async (req, res, next) => {
    try {
        const { name,subname } = req.body;
        
        const existingCategories = await categories.findOne({ name: name })
        if (existingCategories) {
            return res.redirect("/admin/category")
        }

        const subCategoryArray = await subCategories.find({_id:subname})

        const category = new categories({ 
            name:name,
            subCategory:subCategoryArray
        
        });
        await category.save();
        res.redirect('/admin/category')

    } catch (err) {
        console.log(err);
    }
};

const editCategory = async (req, res, next) => {
    try {


        if (req.body.name) {
            const name = req.body.name;
            const id = req.params.id;
            const category = await categories.findOne({ name: name })
    
          
    
            if (category) {
    
                res.redirect('/admin/category')
    
            } else {
                await categories.updateOne({ _id: id }, {
                    $set: { name: req.body.name }
                });
                res.redirect('/admin/category')
            }
        
        } else {
            res.redirect('/admin/category')
        }
        
    } catch (error) {
        console.log(error)
    }


};

const deleteCategory = async(req,res,next)=>{
    try {
        
        const id=req.params.id;
        await categories.updateOne({_id:id},{$set:{delete:true}}).then(()=>{
            res.redirect("/admin/category")
        })
        
    } catch (error) {
        console.log(error)
    }         
  
};

const restoreCategory = async(req,res,next)=>{
    try {
        const id = req.params.id;
        await categories.updateOne({_id:id},{$set:{delete:false}}).then(()=>{
            res.redirect('/admin/category')
        })
    } catch (error) {
        console.log(error)
    }
};






// Sub category management

const getSubCategory=  async(req,res,next)=>{
    try {
        const subCategory = await subCategories.find();
        res.render('admin/subCategory',{subCategory})
        
    } catch (error) {
        console.log(error)
    }
};

const addSubCategory = async(req,res,next)=>{
    try {
        const { name } = req.body;
        const existingSubCategories = await subCategories.findOne({name:name})
        if(existingSubCategories){
            res.redirect('/admin/subCategory')
        }

        const subCategory = new subCategories({name});
        await subCategory.save()
        res.redirect('/admin/subCategory')

    } catch (error) {
        console.log(error)
    }
};

const editSubCategory = async(req,res,next)=>{
    try {
        if (req.body.name) {
            const name = req.body.name;
            const id = req.params.id;
            const subCategory = await subCategories.findOne({name:name});
            if (subCategory) {
                res.redirect('/admin/subCategory');
                
            } else {
                await subCategories.updateOne({_id:id},{$set:{name:req.body.name}});
                res.redirect('/admin/subCategory');
            }

            
        } else {
            res.redirect('/admin/subCategory')
        }
        
    } catch (error) {
        console.log(error);
    }
};

const deleteSubCategory =  async(req,res,next)=>{
    try {
        const id = req.params.id;
        await subCategories.updateOne({_id:id},{$set:{delete:true}}).then(()=>{
            res.redirect('/admin/subCategory');

        });
        
    } catch (error) {
      console.log(error)  
    }
};


const restoreSubCategory =  async(req,res,next)=>{
    try {
        const id = req.params.id;
        await subCategories.updateOne({_id:id},{$set:{delete:false}}).then(()=>{
            res.redirect('/admin/subCategory');

        });
        
    } catch (error) {
      console.log(error)  
    }
};



 








  














module.exports = {
    getCategory,
    addCategory,
    editCategory,
    deleteCategory,
    restoreCategory,
    getSubCategory,
    addSubCategory,
    editSubCategory,
    deleteSubCategory,
    restoreSubCategory
}

