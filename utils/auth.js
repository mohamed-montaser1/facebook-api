exports.requireLogin = (req, res) => {
  if (!req.user) {
    res
      .status(400)
      .json({ status: "fail", message: "You are not logged in", data: null });
    return true; // indicates that we already handled the response
  }
  return false;
};

exports.acceptFriendRequestDirectly = async (res, request) => {
  try {
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: request.receiver },
    });
    await User.findByIdAndUpdate(request.receiver, {
      $addToSet: { friends: request.sender },
    });
    await FriendRequest.findByIdAndDelete(request._id);

    return res.status(200).json({
      status: "success",
      message: "Friend request auto-accepted (they already sent you one)",
    });
  } catch (error) {
    return res.status(500).json({
      status: "fail",
      message: error.message,
      error,
    });
  }
};
