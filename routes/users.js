// Here we handle our routes that start with /
// These routes are used for user's authenticating
// The main code is being handled in controllers.

const express = require("express");
const router = express.Router();
const passport = require("passport");
const catchAsync = require("../utils/catchAsync");
const User = require("../models/user");

// CONTROLLER
const users = require("../controllers/users");

// Route which renders register page.
router.get("/register", users.renderRegister);

// Route which handles creation of new registered user which submits register form.
router.post("/register", catchAsync(users.register));

// Route which handles login of a user.
router.get("/login", users.renderLogin);

// Router which handles authentication of a user submiting login form.
router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
);

router.get("/logout", users.logout);

module.exports = router;
