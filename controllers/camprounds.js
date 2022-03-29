// MODELS
const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary");

// MAPBOX SDK GEOCODING FOR GEOFORWARDING
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

// Here we render our index page.
module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};

// Rendering campground creation form.
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

//  Here we handle form submission of the campground creation form.
module.exports.createCampground = async (req, res, next) => {
  // Here we turn campground location input into geoJson using mapbox's forward Geocode.
  // We than add the geoJson found in body.features to our geoJson field in campground model.
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  console.log(campground);
  campground.author = req.user._id;
  await campground.save();
  req.flash("success", "Successfully created a new campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Here we handle the show campground page.
// We use double populate here, first we populate campgrounds with reviews,
// and than we populate reviews with author. We use this to gain access to
// reviews author information for our show page.
module.exports.showCampground = async (req, res) => {
  const campground = await Campground.findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};

// Here we handle rendering of our campground's edit form.
// If a user somehow attemps to /edit on a delete campground,
// we flash him an error message and redirect him to campgrounds.
// We populate the fields on edit template with the data from the particular campground.
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground });
};

// Here we handle updating of our campground and post submission of the edit form.
// We find the id of the campground and than spread the req.body.campground object
// as a second argument to shorten the process.
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  campground.images.push(...imgs);
  await campground.save();
  // We check if the images were checked for deletion, than we delete them with pull from database.
  // We also delete on images on cloudinary with cloudinary's method.
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${campground._id}`);
};

// Here we handle the deletion of a campground. We also post delete
// the reviews associated with deleted campground using an middleware located
// in campgrounds model.
module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};
