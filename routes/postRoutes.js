const express = require("express");
const router = express.Router();
const controllers = require("../controllers/postController");
const userControllers = require("../controllers/userController");

router.post("/", userControllers.checkUserLogin, controllers.createPost);
router.patch(
  "/:id",
  userControllers.checkUserLogin,
  controllers.checkPermissions,
  controllers.updatePost
);

module.exports = router;
