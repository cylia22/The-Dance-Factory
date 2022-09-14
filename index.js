const mongoose = require('mongoose');
const cities = require('./cities');
//const axios = require('axios');
const { places, descriptors } = require('./seedHelpers');
const DanceOrganization = require('../models/danceOrganization');

mongoose.connect('mongodb://localhost:27017/dance', {
    //useNewUrlParser: true,
    //useCreateIndex: true,
    //useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

// call unsplash and return small image
/* async function seedImg() {
    try {
      const resp = await axios.get('https://api.unsplash.com/photos/random', {
        params: {
          client_id: '50Pa9VWCUtfS8qVDyf6TYad529Ka61ogjR9gDnCAMSs',
          collections: 1114848,
        },
      })
      return resp.data.urls.small
    } catch (err) {
      console.error(err)
    }
  }
*/

const seedDB = async () => {
    await DanceOrganization.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const danceNew = new DanceOrganization({
           //imageUrl: await seedImg(),
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
           image: 'https://placeimg.com/640/480/dance',
           //image:'https://api.unsplash.com/photos/random/dance'
          // image: `https://source.unsplash.com/random/?camping,${i}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Quibusdam dolores vero perferendis laudantium, consequuntur voluptatibus nulla architecto, sit soluta esse iure sed labore ipsam a cum nihil atque molestiae deserunt!',
            price
        })
        await danceNew.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})








