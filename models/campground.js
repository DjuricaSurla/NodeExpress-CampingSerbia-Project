// Here we create model and schema for our campgrounds.
// Author is a foreign key of users's id which helps us later fill
// the entire base with information from the Author model. Same goes for reviews.
// We use this information to show authors of our campgroudns and etc.

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");

// We create an image schema which will be used as an array element
// in campground images. We do this so that we can add virtual method
// to the image shcema, which allows us to set width of the image to 300
// through cloudinary when we are editing a campground page.

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_300");
});

// We add this to the schema to enable virtuals to be converted to Json for
// which we need for our cluster map.
const opts = { toJSON: { virtuals: true } };

const CampGroundSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    // This is how GeoJSON should be represented in mongoose
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

// We created this schema so that we have .properties which is required in order to add
// data to the cluster map on click.
CampGroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

// Middleware which runs after we delete a campground. We get back an object which contains
// saved reviews in it, which we than use to delete all reviews whose id is in that object.
// This is done so that we delete every review associated with deleted campground, since there is no reason
// to store them further. This is simmilar to (ON_DELETE_CASCADE).

CampGroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", CampGroundSchema);
