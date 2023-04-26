const express = require('express');
const userController = require('../controllers/userController');
const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController')
const wishlistController = require('../controllers/wishlistController')
const orderController = require('../controllers/orderController')
const router = express();
const auth = require('../middleware/userAuth')
const bodyParser = require('body-parser');

router.use(express.json());
router.use(express.urlencoded({ extended:true }));

//user 

router.get('/', userController.getHome);

router.get('/register',auth.verifyLoginUser, userController.getRegister);

router.post('/postRegister',auth.verifyLoginUser,userController.postRegister);

router.get('/login',auth.verifyLoginUser,userController.getLogin);

router.post('/postLogin',userController.postLogin);

router.get('/logout',userController.userLogout);


//product management

router.get('/shop',productController.getShopPage);

router.get('/productView/:id',productController.getProductView);

router.get('/category/:id',productController.getCategoryWisePage);

router.get('/brands/:id',productController.getCategoryWisePage);

router.post('/searchProduct',productController.searchProduct);

router.get('/products/:id',productController.getBrandWisePage);



//Cart management

router.get('/cart',auth.userLogin,cartController.viewCart);

router.get('/addToCart/:id',auth.userLogin,cartController.addToCart);

router.post('/changeQuantity',auth.userLogin,cartController.changeQuantity);

router.post('/removeProduct',auth.userLogin,cartController.removeProduct);

//Wishlist management

router.get('/wishlist',auth.userLogin,wishlistController.viewWishlist);

router.get('/addToWishlist/:id',auth.userLogin,wishlistController.addToWishlist);

router.post('/removeFromWishlist',auth.userLogin,wishlistController.removeFromWishlist);

//profile management

router.get('/viewProfile',auth.userLogin,userController.viewProfile);

router.get('/editProfile',auth.userLogin,userController.editProfile);

router.post('/postEditProfile/:id',auth.userLogin,userController.postEditProfile);

router.get('/getAddress',auth.userLogin,userController.getAddress);

router.post('/addNewAddress',auth.userLogin,userController.addNewAddress);

// checkout management

router.get('/checkout',auth.userLogin,orderController.checkoutPage);

router.get('/getAddressDetail/:userId',auth.userLogin,orderController.fetchAddress);

router.post('/placeOrder',auth.userLogin,orderController.placeOrder);

router.post("/verifyPayment",auth.userLogin,orderController.verifyPayment);

router.get('/orderSuccess',auth.userLogin,orderController.orderSuccess);



// Order management

router.get('/getOrders',auth.userLogin,orderController.getOrders);

router.get('/orderedProduct/:id',auth.userLogin,orderController.orderedProduct);

router.post('/cancelOrder/:id',auth.userLogin,orderController.cancelOrder);















module.exports = router