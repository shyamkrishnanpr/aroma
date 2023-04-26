const User = require("../model/userSchema");
const bcrypt = require("bcrypt");
const order = require("../model/orderSchema");
const product = require("../model/productSchema");
const moment = require("moment");




// admin dashboard

const loadDashboard = async (req, res, next) => {
  try {
    const orderData = await order.find({ orderStatus: { $ne: "cancelled" } });

    const totalRevenue = orderData.reduce((accumulator, object) => {
      return accumulator + object.totalAmount;
    }, 0);

    const dailyOrder = await order.find({
      orderDate: moment().format("MMM Do YY"),
    });

    const dailyRevenue = dailyOrder.reduce((accumulator, object) => {
      return accumulator + object.totalAmount;
    }, 0);

    const start = moment().startOf("month");
    const end = moment().endOf("month");
    const monthlyOrder = await order.find({
      orderStatus: { $ne: "cancelled" },
      createdAt: { $gte: start, $lte: end },
    });

    const monthlyRevenue = monthlyOrder.reduce((accumulator, object) => {
      return accumulator + object.totalAmount;
    }, 0);

    const allOrders = orderData.length; 
    const pending = await order.find({ orderStatus: "Pending" }).count();
    const placed = await order.find({ orderStatus: "Placed" }).count();
    const cancelled = await order.find({ orderStatus: "Cancelled" }).count();
    const shipped = await order.find({ orderStatus: "Shipped" }).count();
    const delivered = await order.find({ orderStatus: "Delivered" }).count();
    const cod = await order.find({ paymentMethod: "COD" }).count();
    const online = await order.find({ paymentMethod: "Online" }).count();
    const activeUsers = await User.find({isBlocked:false}).count();
    const productsCount = await product.find({delete:false}).count();


    res.render("admin/home", {
      totalRevenue,
      dailyRevenue,
      monthlyRevenue,
      allOrders,
      pending,
      placed,
      cancelled,
      shipped,
      delivered,
      cod,
      online,
      activeUsers,
      productsCount
    });
  } catch (error) {
    console.log(error.message);
  }
};

//admin login page

const loadLogin = async (req, res, next) => {
  try {
    message = req.session.loginerr;
    res.render("admin/login", { message });
  } catch (error) {
    console.log(error.message);
  }
};

// admin login verifying

const verifyLogin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const userData = await User.findOne({ email: email });
    if (userData) {
      const passwordMatch = await bcrypt.compare(password, userData.password);
      if (passwordMatch) {
        if (userData.is_admin === 0) {
          req.session.loginerr = "Email and password is incorrect";
          res.redirect("/admin/login");
        } else {
          req.session.admin = userData._id;
          res.redirect("admin/home");
        }
      } else {
        req.session.loginerr = "Email and password is incorrect";
        res.redirect("/admin/login");
      }
    } else {
      req.session.loginerr = "Email and password is incorrect";
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//  admin logout
const logout = async (req, res, next) => {
  try {
    req.session.admin = null;
    res.redirect("/admin");
  } catch (error) {
    console.log(error.message);
  }
};

// admin users list
const usersList = async (req, res, next) => {
  try {
    const usersData = await User.find({ is_admin: 0 });
    res.render("admin/usersList", { users: usersData });
  } catch (error) {
    console.log(error.message);
  }
};

// admin block user
const blockUser = async (req, res) => {
  const id = req.params.id;
  await User.updateOne({ _id: id }, { $set: { isBlocked: true } }).then(() => {
    res.redirect("/admin/usersList");
  });
};

// admin unblock user

const unblockUser = async (req, res) => {
  const id = req.params.id;
  await User.updateOne({ _id: id }, { $set: { isBlocked: false } }).then(() => {
    res.redirect("/admin/userslist");
  });
};

// get sales report

const salesReport = async (req, res, next) => {
  try {
    const startDate = req.query.startDate
      ? new Date(req.query.startDate)
      : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    const query = {
      paymentStatus: "paid",
      orderStatus: "Delivered",
    };

    if (startDate) {
      query.createdAt = { $gte: startDate };
    }

    if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      if (query.createdAt) {
        query.createdAt.$lte = endDate;
      } else {
        query.createdAt = { $lte: endDate };
      }
    }

    const salesReport = await order.find(query);

    //   console.log("The sales report is ",salesReport)

    res.render("admin/salesReport", { salesReport });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  loadLogin,
  verifyLogin,
  loadDashboard,
  logout,
  usersList,
  blockUser,
  unblockUser,
  salesReport,
};
