const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, `${__dirname}/../uploads/images`);
  },
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
  fileFilter: (req, file, cb) => {
    // only png, jpg, jpeg, gif, webp accepted
    const fileTypes = /png|jpg|jpeg|gif|webp/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = fileTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Images only supported (png, jpg, jpeg, gif, webp)");
    }

    // only stores images 10mb or less
    if (file.size > 1024 * 1024 * 10) {
      return cb("Image must be less than 10mb");
    }
  },
});

const upload = multer({ storage });

exports.storage = storage;
exports.upload = upload;
