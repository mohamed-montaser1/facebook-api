const Post = require("../models/PostModel");
const User = require("../models/UserModel");

exports.createPost = async (req, res) => {
  if (!req.user) {
    return res.status(401).send({ status: "fail", message: "Unauthorized" });
  }
  const { content, images } = req.body;
  try {
    const post = await Post.create({
      author: req.user.id,
      content,
      images,
    });
    await User.findByIdAndUpdate(req.user.id, {
      $push: {
        posts: post._id,
      },
    });
    return res.status(201).json({ status: "success", data: { post } });
  } catch (error) {
    return res
      .status(500)
      .json({ status: "fail", message: error.message, error });
  }
};

exports.updatePost = (req, res) => {};

exports.deletePost = (req, res) => {};

// Check if the user have permissions to manipulate posts or create ones
exports.checkPermissions = (req, res) => {};
