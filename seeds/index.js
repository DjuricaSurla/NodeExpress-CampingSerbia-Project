// This is a module from which we fill up our mongo database. We randomize most of the
// fields except author and description. We than save and close connection to the database.
// Every time we seed, we delete all previous inputs before putting in new ones.

const mongoose = require("mongoose");
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers");
const cities = require("./cities");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Databse connected");
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;

    const camp = new Campground({
      author: "623df08ddc18586c809280a5",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Adipisci, accusamus quam ipsa dignissimos, dicta harum tempore illo numquam obcaecati quod deleniti perferendis ducimus voluptatem asperiores corrupti et voluptatum voluptas. Quaerat eius reprehenderit tenetur enim beatae eveniet molestiae iure iste, hic at nostrum odio distinctio unde facilis consequatur quo voluptatum. Eveniet!",
      price: price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dp5lg9xye/image/upload/v1648330135/YelpCamp/vksq6gdgyzi6man5hh5u.jpg",
          filename: "YelpCamp/s1srxpdnzhftkhndkymy",
        },
        {
          url: "https://res.cloudinary.com/dp5lg9xye/image/upload/v1648330135/YelpCamp/s1srxpdnzhftkhndkymy.jpg",
          filename: "s1srxpdnzhftkhndkymy",
        },
      ],
    });
    await camp.save();
  }
};

seedDb().then(() => {
  mongoose.connection.close();
});
