// Routers for /campgrounds path.

const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");

// CONTROLLERS
const campgrounds = require("../controllers/camprounds");
// MIDDLEWARE
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
// MODELS
const Campground = require("../models/campground");

// Multer Package which edds body and file object to request body for multipart form submission.
// We require storage from cloudinary file and than upload files processed by multer to cloudinary.
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

// Route for / path. Handles viewing index page and creating new campground.
router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// Route for rendering new campground page.
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Route for /:id, handles everything about showing specific campgrond and crut operations in it.
router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Route for rendering edit specific campground page.
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
