const express = require('express');
const routes = express();
const multer = require('multer');

const session = require('express-session');
const config = require('../config/config');
const bodyParser = require('body-parser');

const auth = require('../middleware/adminAuth');



// routes.use(session({secret:config.sessionSecret}))

routes.use(bodyParser.json());
routes.use(bodyParser.urlencoded({extended:true}));

routes.set('view engine','ejs');
// routes.set('views','./views/admin');

const adminController = require("../controllers/adminController");
const categoryController = require("../controllers/categoryController");
const productController = require("../controllers/productController");
const couponController = require("../controllers/couponController");
const orderController = require('../controllers/adminOrderController');
const bannerController = require('../controllers/bannerController');
const  upload  = require('../middleware/multer');



routes.get('/',auth.isLogout,adminController.loadLogin);

routes.post('/',adminController.verifyLogin);

routes.get('/home',auth.isLogin,adminController.loadDashboard);

routes.get('/logout',auth.isLogin,adminController.logout);

// user management

routes.get('/usersList',auth.isLogin,adminController.usersList);

routes.get('/blockUser/:id',auth.isLogin,adminController.blockUser);

routes.get('/unblockUser/:id',auth.isLogin,adminController.unblockUser);

// category management

routes.get('/category',auth.isLogin,categoryController.getCategory);

routes.post('/addCategory',auth.isLogin,categoryController.addCategory);

routes.post('/editCategory/:id',auth.isLogin,categoryController.editCategory);

routes.get('/deleteCategory/:id',auth.isLogin,categoryController.deleteCategory);

routes.get('/restoreCategory/:id',auth.isLogin,categoryController.restoreCategory);

// subcategory management

routes.get('/subCategory',auth.isLogin,categoryController.getSubCategory);

routes.post('/addSubCategory',auth.isLogin,categoryController.addSubCategory);

routes.post('/editSubCategory/:id',auth.isLogin,categoryController.editSubCategory);

routes.get('/deleteSubCategory/:id',auth.isLogin,categoryController.deleteSubCategory);

routes.get('/restoreSubCategory/:id',auth.isLogin,categoryController.restoreSubCategory);

// product management

routes.get('/productList',auth.isLogin,productController.productDetails);

routes.get('/addProduct',auth.isLogin,productController.addProduct);

routes.post('/postProduct',upload.array('image',3),auth.isLogin,productController.postProduct);

routes.get('/deleteProduct/:id',auth.isLogin,productController.deleteProduct);

routes.get('/restoreProduct/:id',auth.isLogin,productController.restoreProduct);

routes.get('/editProduct/:id',productController.editProduct);

routes.post('/postEditProduct/:id',auth.isLogin,productController.postEditProduct);

// coupon management

routes.get('/coupon',auth.isLogin,couponController.couponPage);

routes.post('/addCoupon',auth.isLogin,couponController.addCoupon);

routes.get('/deleteCoupon/:id',auth.isLogin,couponController.deleteCoupon);

routes.get('/restoreCoupon/:id',auth.isLogin,couponController.restoreCoupon);

routes.post('/editCoupon/:id',auth.isLogin,couponController.editCoupon);

//order management

routes.get('/orders',auth.isLogin,orderController.getOrders);

routes.post('/changeStatus/:id',auth.isLogin,orderController.changeStatus);

routes.get('/orderedProduct/:id',auth.isLogin,orderController.getOrderDetail);


//banner management

routes.get('/banner',auth.isLogin,bannerController.bannerPage);

routes.post('/addBanner',upload.single('bannerImage'),auth.isLogin,bannerController.addBanner);

routes.post('/editBanner/:id',auth.isLogin,bannerController.editBanner);

routes.get('/blockBanner/:id',auth.isLogin,bannerController.blockBanner);

routes.get('/unblockBanner/:id',auth.isLogin,bannerController.unblockBanner);

routes.post('/updateOrder',auth.isLogin,bannerController.updateOrder)

 


 
// sales report

routes.get('/salesReport',auth.isLogin,adminController.salesReport)


// routes.get('*',function(req,res){
//     res.redirect('/admin')
// })



module.exports = routes




