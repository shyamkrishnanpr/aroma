const order = require('../model/orderSchema')
const mongoose = require('mongoose')


//get orders

const getOrders = async(req,res,next)=>{
    try {
        order.aggregate([
            {
                $lookup:
                  {
                    from: "products",
                    localField: "orderItems.productId",
                    foreignField: "_id",
                    as: "product"
                  }
             },
             {
                $lookup:
                  {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "users"
                  }
             },
             {
                $sort:
                {
                    createAt:-1
                }
             }

        ]).then((orderDetails)=>{
            res.render('admin/orders',{orderDetails})

        })
          
    } catch (error) {
        console.log(error)
    }
};

//change order status

const changeStatus = async(req,res,next)=>{
    try {
        const id =  req.params.id;
        const data =  req.body;
        await order.updateOne({_id:id},{$set:{orderStatus:data.orderStatus,paymentStatus:data.paymentStatus}})
        res.redirect("/admin/orders")
    } catch (error) {
        console.log(error)
    }
};

//get order details

const getOrderDetail = async(req,res,next)=>{
    try {
        const id = req.params.id;
        

const orderId = new mongoose.Types.ObjectId(id);
        const orderDetails = await order.find({_id:orderId});

        // console.log('the product detail issssss',orderDetail)
        
        const productData = await order.aggregate([
            {
                $match:{_id:orderId}
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
                $lookup:{
                    from:"products",
                    localField:"productItem",
                    foreignField:"_id",
                    as:"productDetail"
                }
            },
            {
                $project:{
                    productItem: 1,
                    productQuantity: 1,
                    address: 1,
                    name: 1,
                    phonenumber: 1,
                    productDetail: { $arrayElemAt: ["$productDetail", 0] }
                }
            },
            {
                $lookup:{
                    from:"categories",
                    localField:"productDetail.category",
                    foreignField:"_id",
                    as:"categoryName"
                }
            },
            {
                $unwind:"$categoryName"
            }

        ]).exec();


        // console.log(productData)
        res.render('admin/orderDetails',{productData,orderDetails})

        
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    getOrders,
    changeStatus,
    getOrderDetail
}