// Here is the main code for handling user creation and authentication.

// MODEL
const User = require('../models/user');

// Middleware which renders the register template.
module.exports.renderRegister = (req, res) => {
  res.render('users/register');
};

// Middleware which handles the creation of a user from a submitted post request.
module.exports.register = async (req, res, next) => {
  // We do try catch here so that we don't send the user to the default error view through catchAsync.
  // We just want to show a simple alert to the user describing what is wrong.
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password);
    // Passport requires this callback with error argument on login.
    // If we catch an error we flash the message we get from the passport and redirect user back to login.
    req.login(registeredUser, (err) => {
      if (err) return next();
      req.flash('success', 'Welcome to Campgrounds Serbia!');
      res.redirect('/campgrounds');
    });
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('register');
  }
};

// Middleware which renders the login template.
module.exports.renderLogin = (req, res) => {
  res.render('users/login');
};

// Middleware which handles login form post request which logins the user.
// Authentication is done with passport.authenticate method in user routes.
module.exports.login = (req, res) => {
  req.flash('success', 'Welcome back!');
  // Check from which path was user taken to login page, and than return him to the path he wanted.
  const redirectUrl = req.session.returnTo || '/campgrounds';
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// Here we handle the logout of our users. Also done by .logout handled by passport.
module.exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'Goodbye!');
  res.redirect('/campgrounds');
};
