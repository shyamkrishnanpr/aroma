const User = require('../model/userSchema')
const products = require('../model/productSchema')
const userVerification = require('../model/userVerificationSchema')
const otp = require("../model/otpSchema");
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const mailSender = require("../config/mailSender");
const {v4:uuidv4}= require('uuid');
const randomstring = require('randomstring');
const crypto = require('crypto')
const dotenv = require('dotenv');
const banner = require('../model/bannerSchema');
dotenv.config();

// const transporter = nodemailer.createTransport({
//   service:"gmail",
//   auth:{
//     user:process.env.EMAIL,
//     pass:process.env.PASSWORD
//   }
// });


// transporter.verify((error,success)=>{
//   if(error){
//     console.log(error)
//   }else{
//     console.log("ready")
//     console.log(success)
//   }
// })








// home page

const getHome =async(req, res, next) => {
  try {
    const user = req.session.user;
    const product = await products.find({delete:false});
    const banners = await banner.find({blocked:false}).sort({ order: 1 });
    res.render('users/home',{user,product,banners})
  } catch (error) {
    console.log(error);
  }
};





//register page

const getRegister = (req, res, next) => {
  try {
    //   const session = req.session.user
    res.render("users/register")
  } catch (err) {
    next(err)
  }

};



const postRegister = async (req, res, next) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);
    const username =  req.body.username;
    const email = req.body.email;
    const phonenumber = req.body.phonenumber;
    const password = hashPassword

    const userData = await User.findOne({ email: req.body.email })

    if (userData) {
      res.render("users/register", { err_message: 'User already exists' })
    } else {
      const User = {
        username: username,
        email: email,
        phonenumber: phonenumber,
        password: password,     
      };

      mailSender(User).then(async(mailer)=>{
        if (mailer) {
          const userInfo = await otp.findOne({email:email});
          
          res.render("users/otp",{userInfo})
        } else {
          console.log("otp failed",)
        }
      })

  
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

// otp page 

const postOtp = async (req, res, next) => {
  try {

    const body = req.body;
    const cotp = body.otp;
    const sendOtp = await otp.findOne({ email: body.email });
console.log("the sendOtp is ",sendOtp)
    const validOtp = await bcrypt.compare(cotp, sendOtp.otp);

    if (validOtp) {
      res.redirect("/login");
    
      User.create({
        username: body.username,
        email: body.email,
        phonenumber: body.phonenumber,
        password: body.password,
      });
      await otp.findOneAndDelete({ email: body.email })
    } else {
      const userData = await otp.findOne({ email: body.email });
      res.render("users/otp", { userData, invalid: "invalid otp" });
    }
  } catch (error) {
    console.log(error);
  }
}









//login page

const getLogin = (req, res, next) => {
  try {
    res.render("users/login")

  } catch (error) {
    console.log(error);
  }
};




const postLogin = async (req, res, next) => {
  try {
    {
      const email = req.body.email;
      const password = req.body.password;
      const userData = await User.findOne({ email: email });
  
      if (userData) {
        if (userData.isBlocked === false) {
          const passwordMatch = await bcrypt.compare(password, userData.password);
          if (!passwordMatch) {
            res.render('users/login')
          }
          else {
            req.session.user=userData._id;
            res.redirect('/');
          }
  
        } else {
          res.redirect('/login');
        }
  
      }else{
        res.redirect('/login');
      }
    
    }

  } catch (error) {
    console.log(error);
  }
};

// const sendOtpVerificationEmail = async({_id,email},res)=>{
//   try {
//     const otp =`${Math.floor(1000+Math.random()*9000)}`

//     const mailOptions = {
//       from:process.env.EMAIL,
//       to:email,
//       subject:"verify your email",
//       html:`<p>Enter<b>${otp}</b> in the app to verify</p><p>Otp expires in 2 minutes</p>` 
//     };
//     const saltRounds = 10;
//     const hashedOtp = await bcrypt.hash(otp,saltRounds);

//     const newOtpverification=await new userVerified({
//       userId:_id,
//       otp:hashedOtp,
//       createdAt:Date.now(),
//       expiresAt:Date.now()+3600000,
//     });

//     await newOtpverification.save();
//     transporter.sendMail();
//     res.json({
//       status:"PENDING",
//       message:"Verification email sent",
//       data:{
//         userId:_id,
//         email,
//       },
//     });
    
    
//   } catch (error) {
//     res.json({
//       status:"FAILED",
//       message:error.message
//     });
//   }
// };


const userLogout=(req,res,next)=>{
  try {
     delete req.session.user
    res.redirect('/')
  } catch (error) {
    console.log(error)
  }
}


// user profile controller

const viewProfile = async(req,res,next)=>{
  try {
    const user = req.session.user;
    const userData = await User.findOne({ _id: user });

    

    res.render('users/profile',{user,userData})
    
  } catch (error) {
    console.log(error)
  }
};

const editProfile = async(req,res,next)=>{
  try {
    const user = req.session.user;
    const userData = await User.findOne({_id:user});

    res.render('users/editProfile',{user,userData})

    
  } catch (error) {
    console.log(error)
  }
};

const postEditProfile = async(req,res,next)=>{
  try {
    const user = req.session.user;
    await User.updateOne({_id:user},{
      $set:{
        username:req.body.username,
        phonenumber:req.body.phonenumber,
        addressDetail:[{
          housename:req.body.housename,
          postoffice:req.body.postoffice,
          area:req.body.area,
          district:req.body.district,
          state:req.body.state,
          pin:req.body.pin


        }]
      }
    })
    res.redirect('/viewProfile')
    
  } catch (error) {
    console.log(error)
  }
};

const getAddress = async(req,res,next)=>{
  try {
    const user = req.session.user;
    const userData = await User.findOne({_id:user});
    res.render('users/address',{user,userData})
    
  } catch (error) {
    console.log(error)
  }
};

const addNewAddress = async(req,res,next)=>{
  try {
    const user = req.session.user;
    const addAddress = {
      phonenumber:req.body.phonenumber,
      housename:req.body.housename,
      postoffice:req.body.postoffice,
      area:req.body.area,
      district:req.body.district,
      state:req.body.state,
      pin:req.body.pin
    }
    console.log(addAddress)
    await User.updateOne({_id:user},{$push:{addressDetail:addAddress}})
    res.redirect('/getAddress')

    
  } catch (error) {
    console.log(error)
  }
};


module.exports = {
  getHome,
  getRegister,
  postRegister,
  postOtp,
  getLogin,
  postLogin,
  userLogout,
  viewProfile,
  editProfile,
  postEditProfile,
  getAddress,
  addNewAddress,


}


