const mongoose = require("mongoose");
const User = require("../model/userSchema");
const wishlist = require("../model/wishlistSchema");


const addToWishlist = async (req, res, next) => {
  try {
    const id = req.params.id;
    const objId = new mongoose.Types.ObjectId(id);
    const user = req.session.user;

    const proObj = {
      productId: objId,
    };

    const userData = await User.findOne({ _id: user });
    const userWishlist = await wishlist.findOne({ userId: userData._id });

    if (userWishlist) {
      let proExist = userWishlist.product.findIndex(
        (product) => product.productId == id
      );

      if (proExist != -1) {
        res.json({ productExist: true });
      } else {
        wishlist
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {
            res.json({ status: true });
          });
      }
    } else {
      const newWishlist = new wishlist({
        userId: userData._id,
        product: [
          {
            productId: objId,
          },
        ],
      });
      await newWishlist.save()
      .then(() => {
        res.json({ status: true });
      });
      
    }
  } catch (error) {
    console.log(error);
  }
};


const viewWishlist = async (req, res, next) => {
    try {
      let countInWishlist;
      const user = req.session.user;
      const userData = await User.findOne({ _id: user });
  
      // console.log(user);
      const userId = userData._id;
  console.log(userId)
      const wishlistData = await wishlist.aggregate([
        {
          $match: { userId: userId },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productItem",
            foreignField: "_id",
            as: "productDetail",
          },
        },
  
        {
          $project: {
            productItem: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
      ]).exec()
  
      countInWishlist = wishlistData.length;
      res.render("users/wishlist", { user, wishlistData, countInWishlist });
  
      // console.log("count is ",countInWishlist)
      // console.log(wishlistData);
   
    } catch (error) {
      console.log(error);
    }
  };


  const removeFromWishlist = async(req,res,next)=>{
    try {
      const data = req.body;
      const objId = data.productId;


      console.log(objId,"the object id isssss")
      // const objId = new mongoose.Types.ObjectId(data.product);

      await wishlist.aggregate([
        {
          $unwind:"$product"
        },

      ]);
      await wishlist.updateOne(
        {_id:data.wishlistId,"product.productId":objId},
        {$pull:{product:{productId:objId}}}
      ).then(()=>{
        res.json({status:true})
      });

      
    } catch (error) {
      console.log(error)
    }
  };





module.exports = {
  viewWishlist,
  addToWishlist,
  removeFromWishlist
};
