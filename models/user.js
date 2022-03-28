// Here we create a user model. We only create an email and than plug schema
// to passport, which will handle creation of username and password, hashing
// of the passsport and later authentication.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

// Adding passport package to user schema which will add username and password fields.
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
