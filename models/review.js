// Here we create a model for our reviews. For the author
// we connect the id to the User model, so that we can later
// populate the author with the information from the user model.
// We use this when showing author name for a review on show.ejs template.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
