const mongoose = require("mongoose");
const coupon = require("../model/couponSchema");

const couponPage = async (req, res, next) => {
  try {
    const couponData = await coupon.find();
    const couponCount = await coupon.find().count();

    res.render("admin/coupon", { couponData,couponCount });
  } catch (error) {
    console.log(error);
  }
};

const addCoupon = async (req, res, next) => {
  try {
    const dis = req.body.discount;
    const discount = dis / 100;

    coupon
      .create({
        couponName: req.body.couponName,
        discount: discount,
        minLimit: req.body.minLimit,
        maxLimit: req.body.maxLimit,
        expirationTime: req.body.expirationTime,
      })
      .then(() => {
        res.redirect("/admin/coupon");
      });
  } catch (error) {
    console.log(error);
  }
};


const deleteCoupon = async(req,res,next)=>{
    try {
        const id = req.params.id;
        await coupon.updateOne({_id:id},{$set:{delete:true}}).then(()=>{
            res.redirect('/admin/coupon');
        })
        
    } catch (error) {
        console.log(error)
    }
};

const restoreCoupon =  async(req,res,next)=>{
    try {
        const id = req.params.id;
        await coupon.updateOne({_id:id},{$set:{delete:false}}).then(()=>{
            res.redirect('/admin/coupon')
        })
    } catch (error) {
        console.log(error)
    }
};

const editCoupon = async(req,res,next)=>{
  try {
    const id = req.params.id;
    await coupon.updateOne({_id:id},{
      couponName:req.body.couponName,
      discount:req.body.discount/100,
      minLimit:req.body.minLimit,
      maxLimit:req.body.maxLimit,
      expirationTime:req.body.expirationTime

    }).then(()=>{
      res.redirect('/admin/coupon')
    })
    
  } catch (error) {
    console.log(error)
  }
};




module.exports = {
  couponPage,
  addCoupon,
  deleteCoupon,
  restoreCoupon,
  editCoupon
};
