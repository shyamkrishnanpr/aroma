const multer = require("multer");
const path = require("path");
const fs = require("fs");


//configuration for the multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public");
  },
  filename: function (req, file, cb) {
    cb(null, `productImages/${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Multer Filter
const multerFilter = (req, file, cb) => {

  if (file.mimetype.split('/')[1] === 'jpeg' ||
    file.mimetype.split('/')[1] === 'png' ||
    file.mimetype.split('/')[1] === 'jpg') {
    cb(null, true);
  } else {
    cb(new Error("Not a JPEG, PNG or JPG File!!"), false);
  }
}

const upload = multer({ storage: storage, fileFilter:multerFilter  });

module.exports = upload;







