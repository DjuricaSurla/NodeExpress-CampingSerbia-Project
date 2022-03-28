// If we are in development we take the pross env variables from .env using dotenv.
// Later when we go into production we remove env file.

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");

// PASSPORT PACKAGE
const passport = require("passport");
const LocalStrategy = require("passport-local");

// USER MODEL
const User = require("./models/user");

// ROUTERS
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campground");
const reviewRoutes = require("./routes/reviews");

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/yelp-camp";

// MONGOOSE CONNECTION
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

// Middleware which handles our views. We use EJS for embedded javascript. And we set
// absolute path to views directory, in case we don't run app.js strictly from yelpcamp folder.
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Mongo sanitize to prevent mongo injection.
app.use(mongoSanitize());

// Middleware which enables us to use and read from req.body parameter. Adds body object to the request object.
app.use(express.urlencoded({ extended: true }));

// Middleware in which helps us path and use our static files like css and js used in templates.
app.use(express.static(path.join(__dirname, "public")));

// Middleware to use MethodOverride package, which help us overwrite POST request to Delete,Put,Patch etc.
app.use(methodOverride("_method"));

const secret = process.env.SECRET || "thisshouldbeabettersecret";
// Mongo store to store sessions on mongo-atlas.
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: secret,
  touchAfer: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log("Session store error", e);
});

// Here we configure our session and cookie and run it with our session middleware.
const sessionConfig = {
  store: store,
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

app.use(session(sessionConfig));

// Middleware which runs our flash package for flash message.
app.use(flash());

// Group of middleware which handles our authentication with Passport package.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware which sets local variables which we than use in our templates
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Middleware which routes requests to particular routers.
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get("/", (req, res) => {
  res.render("home");
});

// Middleware which handles user's request to all unknown routes and than throws
// a new custom ExpressError that we defined in utils with message of "Page not Found" and 404 status.
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

// A middleware which is furthest down the line. It checks for errors and renders error page.
// If the caught error doesn't contain message and status code, we add default ones.
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error", { err });
});

// Here we set our server to listen on localhost 3000.

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`LISTENING ON PORT ${port}!`);
});
