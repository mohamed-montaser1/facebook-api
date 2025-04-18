const Post = require("../models/PostModel");
const { User } = require("../models/UserModel");

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

exports.updatePost = async (req, res) => {
  try {
    const newPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    return res.status(200).json({
      status: "success",
      data: { post: newPost },
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    await Post.findOneAndDelete(req.params.id);
    return res.status(200).json({
      status: "success",
      message: "post has been deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};

// Check if the user have permissions to manipulate posts or create ones
exports.checkPermissions = async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ status: "fail", message: "Post not found" });
  }
  const author = post.author;
  const user = req.user;

  if (user.id !== author) {
    return res.status(403).json({ status: "fail", message: "forbidden!" });
  }

  return next();
};
