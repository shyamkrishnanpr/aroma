const mongoose = require("mongoose");
const User = require("../model/userSchema");
const cart = require("../model/cartSchema");
const coupon = require("../model/couponSchema");
const order = require("../model/orderSchema");
const products = require("../model/productSchema");
const instance = require("../middleware/razorpay")
const Razorpay = require('razorpay');
const crypto = require('crypto');
const moment = require("moment");
const { response } = require("express");

const checkoutPage = async (req, res, next) => {
  try {
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
  
    const productData = await cart
      .aggregate([
        {
          $match: { userId: userData.id },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            productItem: "$product.productId",
            productQuantity: "$product.quantity",
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
            productQuantity: 1,
            productDetail: { $arrayElemAt: ["$productDetail", 0] },
          },
        },
        {
          $addFields: {
            productPrice: {
              $multiply: ["$productQuantity", "$productDetail.price"],
            },
          },
        },
      ])
      .exec();

    const sum = productData.reduce((accumulator, object) => {
      return accumulator + object.productPrice;
    }, 0);



   req.session.sum = sum
   
    // console.log(sum)
    // console.log(productData)
    // console.log(userData)

    res.render("users/checkout", { user, productData, sum, userData });
  } catch (error) {
    console.log(error);
  }
};

const fetchAddress = async (req, res, next) => {
  try {
    const addressId = req.params.userId;
    console.log(addressId);
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    const addressDetail = userData.addressDetail.id(addressId);
    if (!addressDetail) {
      return res.json({ message: "No addresses" });
    }
    res.json(addressDetail);
  } catch (error) {
    console.log(error);
  }
};


function checkCoupon(data, id) {
  return new Promise((resolve) => {
    if (data.coupon) {
      coupon
        .find(
          { couponName: data.coupon },
          { users: { $elemMatch: { userId: id } } }
        )
        .then((exist) => {
          if (exist[0].users.length) {
            resolve(true);
          } else {
            coupon.find({ couponName: data.coupon }).then((discount) => {
              resolve(discount);
            });
          }
        });
    } else {
      resolve(false);
    }
  });
};





const placeOrder = async (req, res, next) => {
  try {
    let invalid;
    let couponDeleted;
    let couponExpired;
    let couponMinlimit;
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });
    const cartData = await cart.findOne({ userId: userData._id });
    const objId = userData._id

  

    const data = req.body;

    if (data.coupon) {
      invalid = await coupon.findOne({ couponName: data.coupon });

      console.log(req.session.sum<invalid?.minLimit)
      if (invalid?.delete == true) {
        couponDeleted = true;
      }else if(invalid?.expirationTime&&new Date()>new Date(invalid.expirationTime)){
        couponExpired = true;
      }else if( req.session.sum<invalid?.minLimit){     
        couponMinlimit = true;
        
      }
    
    } else {
      invalid = 0;
    }

    if (invalid == null) {
      res.json({ invalid: true });
    } else if (couponDeleted) {
      res.json({ couponDeleted: true });
    }else if(couponExpired){
      res.json({couponExpired:true})
    }else if(couponMinlimit){
      res.json({couponMinlimit:true})
    }
    
    else {
      const discount = await checkCoupon(data, objId);
      if (discount == true) {
        res.json({ coupon: true });
      } else {
        if (cartData) {
          const productData = await cart
            .aggregate([
              {
                $match: { userId: userData.id },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  productItem: "$product.productId",
                  productQuantity: "$product.quantity",
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
                  productQuantity: 1,
                  productDetail: { $arrayElemAt: ["$productDetail", 0] },
                },
              },
              {
                $addFields: {
                  productPrice: {
                    $multiply: ["$productQuantity", "$productDetail.price"],
                  },
                },
              },
            ])
            .exec();

          const sum = productData.reduce((accumulator, object) => {
            return accumulator + object.productPrice;
          }, 0);
          console.log("The sum in checkout is", sum);
          if (discount == false) {
            var total = sum;
          } else {
            let dis = sum * discount[0].discount;
            if (dis > discount[0].maxLimit) {
              total = sum - discount[0].maxLimit;
            } else {
              total = sum - dis;
            }
          }

          const orderData = new order({
            userId: userData._id,
            username: userData.username,
            phonenumber: req.body.phonenumber,
            housename: req.body.housename,
            postoffice: req.body.postoffice,
            area: req.body.area,
            district: req.body.district,
            state: req.body.state,
            pin: req.body.pin,
            orderItems: cartData.product,
            totalAmount: total,
            paymentMethod: req.body.paymentMethod,
            orderDate: moment().format("MMM Do YY"),
            deliveryDate: moment().add(3, "days").format("MMM Do YY"),
          });

          if (req.body.paymentMethod === "COD") {
            const orderDatas = await orderData.save();
            const orderId = orderDatas._id;
            await order
              .updateOne({ _id: orderId }, { $set: { orderStatus: "Placed" } })
              .then(() => {

                res.json({ success: true ,orderId:orderId});

                // console.log("The obj id before coupon is ", objId);
              });
              await coupon.updateOne(
                { couponName: data.coupon },
                { $push: { users: { userId: objId } } }
              );

          } 
          else if (req.body.paymentMethod === "Online") {
        
            const orderDatas = await orderData.save()
            const orderId = orderDatas._id
            const amount = orderData.totalAmount * 100;
          
            var options = {
              amount: amount, // amount in the smallest currency unit
              currency: "INR",
              receipt: "" + orderId,
            };
          
            instance.orders.create(options, function (err, order) {
              if (err) {
                console.log(err);
              } else {
                console.log(order);
                res.json({ order: order });
              }
            });
            await coupon.updateOne(
              { couponName: data.coupon },
              { $push: { users: { userId: objId } } }
            );

          
          }else if(req.body.paymentMethod === "Wallet"){

            if(userData.walletTotal < orderData.totalAmount){

              res.json({wallet : true})

            }else{

              const orderDatas = await orderData.save()
                const orderId = orderDatas._id

                order.updateOne({ _id: orderId }, { $set: { paymentStatus: "paid", orderStatus: 'Placed' } }).then(async () => {

                  const updatedWalletTotal = userData.walletTotal - orderDatas.totalAmount;
                  

                  await User.updateOne(
                    { _id: userData._id },
                    { $set: { walletTotal: updatedWalletTotal } }
                  );

                  res.json({ success: true });
                  coupon.updateOne(
                    { couponName: data.coupon },
                    { $push: { users: { userId: objId } } }
                  )

                }).catch((err) => {
                  console.log(err);
                  res.json({ status: false, err_message: "Payment failed" });
                  order.deleteOne({ _id: orderId })
                })

              }
          }



        } else {

        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};








const verifyPayment = async (req, res, next) => {
  try {

    console.log("hello")

    const details = req.body;
    
    let hmac = crypto.createHmac("SHA256", process.env.key_secret);
    hmac.update(
      details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
    );
    hmac = hmac.digest("hex");

    if (hmac == details.payment.razorpay_signature) {
      const objId = new mongoose.Types.ObjectId(details.order.receipt);

console.log("The object id issssssss",objId)

      order
        .updateOne(
          { _id: objId },
          { $set: { paymentStatus: "paid", orderStatus: "Placed" } }
        )
        .then(() => {
          res.json({ success: true,orderId: objId });
        })
        .catch((err) => {
          console.log(err);
          res.json({ status: false });
          order.findByIdAndDelete({ _id: objId });
        });
    } else {
      console.log(err);
      res.json({ status: false });
      order.findByIdAndDelete({ _id: objId });
    }
  } catch (err) {
    next(err);
  }
};


const orderSuccess = async (req, res, next) => {
  try {
    const user = req.session.user;

    const id = req.params.id
 
    const userData = await User.findOne({_id:user})
    const orderDetails = await order.findOne({userId:userData._id}).sort({createdAt:-1})



    res.render("users/orderSuccess", { user,orderDetails });

    const orderItems = orderDetails.orderItems;

   


    for (let i = 0; i < orderItems.length; i++) {
      const productId = orderItems[i].productId;
      const quantityOrdered = orderItems[i].quantity;

   
      const product = await products.findById(productId);

      if (product) {
    
        product.stock -= quantityOrdered;

        await product.save();
      }
    }

    const userId = await User.findOne({ _id: user }, { userId: 1 });
   
    const cartId = userId._id;
    await cart.deleteOne({ userId: cartId });
  } catch (error) {
    console.log(error);
  }
};










const getOrders = async(req,res,next)=>{
  try {
    const user = req.session.user;
    const userData = await User.findOne({_id:user});
    const userId = userData._id;
    const objId = new mongoose.Types.ObjectId(userId)
console.log(userId)
    const productData = await order.aggregate([
      {
        $match:{
          $and:[
            {userId:userData._id},
            {orderStatus: {$nin:["Delivered","Cancelled"]}}
          ]
        }

      },

      {
        $unwind:"$orderItems"
      },
      {
        $project:{
          productItem: "$orderItems.productId",
          productQuantity: "$orderItems.quantity",
          address: 1,
          name: 1,
          phonenumber: 1,
          totalAmount: 1,
          orderStatus: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          orderDate: 1,
          deliveryDate: 1,
          createdAt: 1,
        }
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
          productQuantity: 1,
          name: 1,
          phonenumber: 1,
          address: 1,
          totalAmount: 1,
          orderStatus: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          orderDate: 1,
          deliveryDate: 1,
          createdAt: 1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "productDetail.category",
          foreignField: "_id",
          as: "categoryName",
        },
      },
      {
        $unwind: "$categoryName",
      },
    ]).sort({ createdAt: -1 });

// console.log(productData)

const previousData = await order.aggregate([
  {
    $match:{
      $and:[
        {userId:userData._id},
        {orderStatus: {$in:["Delivered","Cancelled"]}}
      ]
    }
  },
  {
    $unwind:"$orderItems"
  },
  {
    $project:{
      productItem: "$orderItems.productId",
      productQuantity: "$orderItems.quantity",
      address: 1,
      name: 1,
      phonenumber: 1,
      totalAmount: 1,
      orderStatus: 1,
      paymentMethod: 1,
      paymentStatus: 1,
      orderDate: 1,
      deliveryDate: 1,
      createdAt: 1,
    }
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
      productQuantity: 1,
      name: 1,
      phonenumber: 1,
      address: 1,
      totalAmount: 1,
      orderStatus: 1,
      paymentMethod: 1,
      paymentStatus: 1,
      orderDate: 1,
      deliveryDate: 1,
      createdAt: 1,
      productDetail: { $arrayElemAt: ["$productDetail", 0] },
    },
  },
  {
    $lookup: {
      from: "categories",
      localField: "productDetail.category",
      foreignField: "_id",
      as: "categoryName",
    },
  },
  {
    $unwind: "$categoryName",
  },



]).sort({ createdAt: -1 });

// console.log(previousData)


    res.render('users/orders',{user,productData,previousData})
  } catch (error) {
    console.log(error)
  }
};

const orderedProduct = async(req,res,next)=>{
  try {
    const user = req.session.user;
    const id = req.params.id;
    const userData = await User.findOne({_id:user})
    const orderDetails = await order.find({userId:userData._id}).sort({createdAt:-1})

    const objId = new mongoose.Types.ObjectId(id)

    const productData = await order.aggregate([
      {
        $match:{_id:objId}
      },
      {
        $unwind:"$orderItems"
      },
      {
        $project:{
          productItem:"$orderItems.productId",
          productQuantity:"$orderItems.quantity",
          address:1,
          name:1,
          phonenumber:1

        }
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
        $project:{
          productItem:1,
          productQuantity:1,
          address:1,
          name:1,
          phonenumber:1,
          productDetail: { $arrayElemAt: ["$productDetail", 0] },
        }
      },
      {
        $lookup: {
          from: "categories",
          localField: "productDetail.category",
          foreignField: "_id",
          as: "categoryName",
        },
      },
      {
        $unwind: "$categoryName",
      },


    ]);

    // console.log(productData)
    // console.log(orderDetails)

    res.render('users/orderDetail',{user,productData,orderDetails})
    
  } catch (error) {
    console.log(error)
  }

};

const cancelOrder = async(req,res,next)=>{
  try {
    const data = req.params.id;
    const orderData = await order.findOne({_id:data});
    
    const refundAmount = orderData.totalAmount;
    const userData = await User.findOne({_id:orderData.userId});

    const updateWalletTotal = userData.walletTotal + refundAmount;
   
   
    if (orderData.paymentStatus === "paid") {
    await User.updateOne(
      { _id: orderData.userId },
      { $set: { walletTotal: updateWalletTotal } }
    );
    }

    await order.updateOne({ _id: data }, { $set: { orderStatus: "Cancelled" } })

    console.log("hellooo")
    res.redirect("/getOrders");

    
  } catch (error) {
    console.log(error)
  }
}

module.exports = {
  checkoutPage,
  fetchAddress,
  placeOrder,
  verifyPayment,
  orderSuccess,
  getOrders,
  orderedProduct,
  cancelOrder
};
