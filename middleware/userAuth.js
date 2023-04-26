const User = require("../model/userSchema");

const verifyLoginUser = async (req, res, next) => {
  try {
    if (req.session.user) {
      res.redirect("/");
    } else {
      next();
    }
  } catch (error) {
    console.log(error);
  }
};

const userLogin = async (req, res, next) => {
  try {
    const user = req.session.user;
    if (user) {
      const userData = await User.findOne({ _id: user });
      if (userData.isBlocked === true) {
        delete req.session.user;
      } else {
      }
    } else {
    }

    if (req.session.user) {
      next();
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  verifyLoginUser,
  userLogin,
};
