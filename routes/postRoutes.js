const express = require("express");
const router = express.Router();
const controllers = require("../controllers/postController");
const userControllers = require("../controllers/userController");
const { upload } = require("../utils/imageStorage");

// Create Post
router.post(
  "/",
  userControllers.checkUserLogin,
  upload.array("images", 10),
  controllers.createPost
);

// Update Post
router.patch(
  "/:id",
  userControllers.checkUserLogin,
  controllers.checkPermissions,
  controllers.updatePost
);

// Delete Post
router.delete(
  "/:id",
  userControllers.checkUserLogin,
  controllers.checkPermissions,
  controllers.deletePost
);

module.exports = router;
