const mongoose = require("mongoose");
const cart = require("../model/cartSchema");
const User = require("../model/userSchema");
const products = require("../model/productSchema")

let countInCart;

//add to cart
const addToCart = async (req, res, next) => {
  try {
    const id = req.params.id;
    const objId = new mongoose.Types.ObjectId(id);
    const user = req.session.user;

    const proObj = {
      productId: objId,
      quantity: 1,
    };
    const userData = await User.findOne({ _id: user });
    const userCart = await cart.findOne({ userId: userData._id });
    const product = await products.findById(objId);

    if (!product) {
      return res.json({ success: false, message: 'Product not found' });
    }

    if (userCart) {
      const proExist = userCart.product.findIndex(
        (product) => product.productId == id
      );
      if (proExist != -1) {
        await cart.aggregate([
          {
            $unwind: "$product",
          },
        ]);
        if (product.stock - userCart.product[proExist].quantity < 1) {
          return res.json({ status: false, message: 'No more stock available' });
        }
        await cart.updateOne(
          { userId: userData._id, "product.productId": objId },
          { $inc: { "product.$.quantity": 1 } }
        );
        res.json({ success: true });
      } else {
        if (product.stock < 1) {
          return res.json({ success: false, message: 'Temporarily out of stock' });
        }
        cart
          .updateOne({ userId: userData._id }, { $push: { product: proObj } })
          .then(() => {
            res.json({ success: true });
          });
      }
    } else {
      if (product.stock < 1) {
        return res.json({ success: false, message: 'Product out of stock' });
      }
      const newCart = new cart({
        userId: userData.id,
        product: [
          {
            productId: objId,
            quantity: 1,
          },
        ],
      });
      newCart.save().then(() => {
        res.json({ success: true });
      });
    }
  } catch (error) {
    console.log(error);
  }
};



//view cart

const viewCart = async (req, res, next) => {
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

    console.log("The sum in view cart is ",sum)
    countInCart = productData.length;

    res.render("users/cart", { user, productData, sum, countInCart });
  } catch (error) {
    console.log(error);
  }
};


const changeQuantity = async (req, res, next) => {
  try {
    const data = req.body;
    const objId = new mongoose.Types.ObjectId(data.product);
    const product = await products.findById(objId);
    const currentStock = product.stock;


    if (data.count == -1 && data.quantity == 1) {
      cart
        .updateOne(
          { _id: data.cart, "product.productId": objId },
          { $pull: { product: { productId: objId } } }
        )
        .then(() => {
          res.json({ quantity: true });
        })
        .catch((err) => console.log(err));


    }else if(data.count==1&&data.quantity==currentStock){
      res.json({status:false})

    }
    
    else {
      cart
        .updateOne(
          { _id: data.cart, "product.productId": objId },
          { $inc: { "product.$.quantity": data.count } }
        )
        .then(async () => {
          const productData = await cart.aggregate([
            {
              $match: { _id: new mongoose.Types.ObjectId(data.cart) },
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
              $addFields:{
                productPrice:{
                  $multiply:["$productQuantity","$productDetail.price"]
                }
              }
            },
            {
              $group:{
                _id:null,               
                total:{
                  $sum:{$multiply:["$productQuantity","$productDetail.price"]}
                }
              }
            }
          ]).exec();

          const sum = productData.reduce((accumulator, object) => {
            return accumulator + object.productPrice;
          }, 0);

          console.log(productData)
        
          res.json({ success: true, productData: productData,sum});
        });

    }
    
  } catch (error) {
    console.log(error);
  }
};




const removeProduct = async (req, res, next) => {
  try {
    const data = req.body;
    const objId = new mongoose.Types.ObjectId(data.product);

    await cart.aggregate([
      {
        $unwind: "$product",
      },
    ]);
    await cart
      .updateOne(
        { _id: data.cart, "product.productId": objId },
        { $pull: { product: { productId: objId } } }
      )
      .then(() => {
        res.json({ success: true });
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  addToCart,
  viewCart,
  changeQuantity,
  removeProduct,
};
