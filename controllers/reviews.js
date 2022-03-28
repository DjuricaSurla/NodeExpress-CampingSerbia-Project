// MODELS
const Review = require("../models/review");
const Campground = require("../models/campground");

// Here we create a review and than flash the message if it was successful.
// We create new models for campground and review. Set the request user to review.author.
// We then push review into the review field in campgrounds and save both models.
module.exports.createReview = async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Created new review!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Middleware which handles deletion of review.
// We find campground by the id, and than with $pull we remove all instances of reviews in it
// in which the id matches with the reviewId we get from request.
// We also remove review by id from our review model.
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(req.params.reviewId);
  req.flash("success", "Successfully deleted a review!");
  res.redirect(`/campgrounds/${id}`);
};
