// Routers for our reviews. We handle incoming requests that start with /campgrounds/id/reviews

const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
// MODELS
const Review = require("../models/review");
const Campground = require("../models/campground");
// CONTROLLERS
const reviews = require("../controllers/reviews");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// Route for posting (creating) reviews.
router.post(`/`, isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Route which handles deleting reviews.
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
