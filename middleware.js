// This file handles our middleware

// JOI SCHEMAS
const { campgroundSchema, reviewSchema } = require("./schemas.js");
// EXPRESS ERROR FROM UTILS
const ExpressError = require("./utils/ExpressError");
// MODELS
const Campground = require("./models/campground");
const Review = require("./models/review");

// This is a middleware which checks if the user is logged in. If he is not, we store his original url,
// flash him a message, and redirect him to login page. After he logins, login router should redirect him back
// to his original destination.
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first!");
    return res.redirect("/login");
  }
  next();
};

// In this middleware we validate our campground schema against joi schema. We destructure the error, and,
// if one exists, we create our new custom ExpressError and throw it.
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

// This is a middleware which checks if the current user's id matches the id in campground.author.
// We use this for authorization. If user is not an author we flash him an error message and redirect him.
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user.id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// This is same as previous middleware, except that it checks if the current user is the author of the review.
module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user.id)) {
    req.flash("error", "You do not have permission to do that!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

// Another middleware which validates review model's schema against joi's review schema.
// We throw an error message if validation fails. JOI provides a great way to ensure that all user
// input will match the requested type.
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
