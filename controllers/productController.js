
const mongoose = require('mongoose');
const products = require("../model/productSchema");
const categories = require("../model/categorySchema");
const subCategories = require("../model/subCategorySchema");
// const Id = require('valid-objectid');

var fs = require("fs");
var path = require("path");

// get product list

const productDetails = async (req, res, next) => {
  try {
    const product = await products.find();
    res.render("admin/productList", { product });
  } catch (error) {
    console.log(error);
  }
};

// add product

const addProduct = async (req, res, next) => {
  try {
    const category = await categories.find();
    const subCategory = await subCategories.find();
    res.render("admin/addProduct", { category, subCategory });
  } catch (error) {
    console.log(error);
  }
};

const postProduct = async (req, res, next) => {
  try {

    // Perform validation
    const errors = {};

    if (!req.body.name) {
      errors.name = 'Please enter a product name';
    }

    if (!req.body.price) {
      errors.price = 'Please enter a valid price';
    }

    if (!req.body.description) {
      errors.description = 'Please enter a description';
    }

    if (!req.body.brand) {
      errors.brand = 'Please enter a brand';
    }

    if (!req.body.stock) {
      errors.stock = 'Please enter a valid number';
    }

    if (!req.body.size) {
      errors.size = 'Please enter a size';
    }

    if (!req.body.images) {
      errors.images = 'Please add the image files';
    }

    if (!req.body.category) {
      errors.category = 'Please select the category';
    }

    if (!req.body.subCategory) {
      errors.subCategory = 'Please select the subcategory';
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ errors });
    }

    // Save the product
    const images = req.files.map((file) => ({
      path: file.filename,
    }));

    const product = new products({
      name: req.body.name,
      price: req.body.price,
      image: images,
      brand: req.body.brand,
      size: req.body.size,
      description: req.body.description,
      delete: 0,
      stock: req.body.stock,
      category: req.body.category,
      subCategory: req.body.subcategory,
    });

    await product.save();

    res.redirect('/admin/productList');
  } catch (error) {
    console.log(error);
  }
};


//delete product

const deleteProduct = async (req, res, next) => {
  const id = req.params.id;
  await products.updateOne({ _id: id }, { $set: { delete: true } }).then(() => {
    res.redirect("/admin/productList");
  });
};

// restore product

const restoreProduct = async (req, res, next) => {
  const id = req.params.id;
  await products
    .updateOne({ _id: id }, { $set: { delete: false } })
    .then(() => {
      res.redirect("/admin/productList");
    });
};

//edit product page
const editProduct = async (req, res, next) => {
  try {
    const id = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('Invalid product id');
    }
    const productData = await products.findOne({_id:id});
    console.log("product data in edit page isssss",productData);
    res.render("admin/editProduct", { productData });
  } catch (error) {
    console.log(error);
  }
};

// post product edit

const postEditProduct = async (req, res, next) => {
  try {
    const id = req.params.id;

    console.log(req.body.name)

  
    await products.updateOne(
      { _id: id},
      {
        $set: {
          name: req.body.name,
          price: req.body.price,
          //   image:images,
          brand: req.body.brand,
          size: req.body.size,
          description: req.body.description,
          stock:req.body.stock
        },
      }
    )
    res.redirect("/admin/productList")
  } catch (error) {
    console.log(error);
  }
};

// user side products shop page

const getShopPage = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
       
    const sortOption = req.query.sort;
    let sort = {};

    if (sortOption === "low-to-high") {
      sort.price = 1;
    } else if (sortOption === "high-to-low") {
      sort.price = -1;
    }

    const user = req.session.user;

    const category = await categories.find({ delete: false });
    const productCount = await products.find({ delete: false }).count();
    const brands = await products.distinct("brand");

    let product;
    let totalPages;
    let pageNumbers;

    if (req.method === "POST" && req.body.searchInput) {
      // call searchProduct function if search form is submitted
      return searchProduct(req, res, next);
    } else {
      // render regular shop page
      product = await products
        .find({ delete: false })
        .sort(sort)
        .skip(skip)
        .limit(limit);
      totalPages = Math.floor(productCount / limit);
      pageNumbers = [];
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    }

    res.render("users/shop", {
      user,
      product,
      category,
      productCount,
      brands,
      page,
      totalPages,
      pageNumbers,
    });
  } catch (error) {
    console.log(error);
  }
};

// get category wise page

const getCategoryWisePage = async (req, res, next) => {
  try {
    const id = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;
    const count = await products
      .find({ category: id, delete: false })
      .populate("category")
      .count();
    const totalPages = Math.ceil(count / limit);
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }

    const sort = {};
    const sortOption = req.query.sort;
    if (sortOption === "low-to-high") {
      sort.price = 1;
    } else if (sortOption === "high-to-low") {
      sort.price = -1;
    }

    let product;
    const searchItem = req.query.search;
    if (searchItem) {
      product = await products
        .find({
          category: id,
          delete: false,
          name: { $regex: searchItem, $options: "i" },
        })
        .populate("category")
        .sort(sort)
        .skip(skip)
        .limit(limit);
    } else {
      product = await products
        .find({ category: id, delete: false })
        .populate("category")
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }

    const user = req.session.user;
    const category = await categories.find({ delete: false });
    const brands = await products.distinct("brand");
    const productCount = await products
      .find({ category: id, delete: false })
      .populate("category")
      .count();

    res.render("users/shop", {
      user,
      product,
      category,
      brands,
      productCount,
      page,
      totalPages,
      pageNumbers,
      searchItem,
    });
  } catch (error) {
    console.log(error);
  }
};



//get brand wise page
const getBrandWisePage = async (req, res, next) => {
  const user = req.session.user;
  const id = req.params.id;
  const category = await categories.find({ delete: false });
  const brands = await products.distinct("brand");

  let product = await products.find({ delete: false }).populate("category");

  product = product.find({ brand: id }, function (err, products) {
    if (err) {
      console.log(err);
      res.send("An error occurred.");
    } else {
      res.render("users/shop", { user, products, category, brands });
    }
  });
};

//search products

const searchProduct = async (req, res, next) => {
  try {
    const searchItem = req.body.searchInput;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;
    const skip = (page - 1) * limit;
    const count = await products.find({
      name: { $regex: searchItem, $options: "i" },
    }).count();

    const totalPages = Math.ceil(count / limit);
    const pageNumbers = [];
    for (let i = 1; i < totalPages; i++) {
      pageNumbers.push(i);
    }

    const user = req.session.user;
    const category = await categories.find({ delete: false });
    const subCategory = await subCategories.find({ delete: false });
    const brands = await products.distinct("brand");

    const product = await products.find({
      name: { $regex: searchItem, $options: "i" },
    })
   
    .skip(skip)
      .limit(limit);
    ;
    res.render("users/shop", { user, product, category, subCategory, brands,page,
        totalPages,
        pageNumbers, });
  } catch (error) {
    console.log(error);
  }
};



// single product view page

const getProductView = async (req, res, next) => {
  try {
    const user = req.session.user;
    let product = await products
      .findOne({ _id: req.params.id, delete: false })
      .populate("category");
    let similar = await products.find({
      category: product.category._id,
      delete: false,
    });

    console.log(similar);
    res.render("users/productView", { user, product, similar });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  productDetails,
  addProduct,
  postProduct,
  deleteProduct,
  restoreProduct,
  editProduct,
  postEditProduct,
  getShopPage,
  getProductView,
  getCategoryWisePage,
  searchProduct,
  getBrandWisePage,
};
