const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  author: {
    type: String,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: {
    type: Number,
    default: 0,
  },
  images: {
    type: [String],
    default: [],
  },
  comments: {
    type: [String],
    ref: "Comment",
    default: [],
  },
});

postSchema.set("toJSON", {
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = doc._id;
    delete ret._id;
    return ret;
  },
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
