const { User } = require("../models/UserModel");

// DONE
exports.getUser = async (req, res) => {
  const username = req.params.username;

  if (requireLogin(req, res)) return;

  const user = await User.findOne({ username }).select("-password");

  if (!user) {
    res.set("Cache-Control", "public, max-age=3600");
    return res.status(404).json({
      status: "fail",
      data: "User not found",
    });
  }

  res.set("Cache-Control", "public, max-age=3600");
  return res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
};
