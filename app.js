const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { danceOrganizationSchema, reviewSchema } = require('./schemas.js');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const DanceOrganization = require('./models/danceOrganization');
const Review = require('./models/review');

mongoose.connect('mongodb://localhost:27017/dance', {
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

const validateDanceOrganization = (req, res, next) => {
    const { error } = danceOrganizationSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

app.get('/', (req, res) => {
    res.render('home')
});
app.get('/danceOrganizations', catchAsync(async (req, res) => {
    const danceOrganizations = await DanceOrganization.find({});
    res.render('danceOrganizations/index', { danceOrganizations })
}));

app.get('/danceOrganizations/new', (req, res) => {
    res.render('danceOrganizations/new');
})

app.post('/danceOrganizations', validateDanceOrganization, catchAsync(async (req, res, next) => {
    // if (!req.body.campground) throw new ExpressError('Invalid Campground Data', 400);
    const danceOrganization = new DanceOrganization(req.body.campground);
    await danceOrganization.save();
    res.redirect(`/danceOrganizations/${danceOrganization._id}`)
}))

app.get('/danceOrganizations/:id', catchAsync(async (req, res,) => {
    const danceOrganization = await DanceOrganization.findById(req.params.id).populate('reviews');
    res.render('danceOrganizations/show', { danceOrganization });
}));

app.get('/danceOrganizations/:id/edit', catchAsync(async (req, res) => {
    const danceOrganization = await DanceOrganization.findById(req.params.id)
    res.render('danceOrganizations/edit', { danceOrganization });
}))

app.put('/danceOrganizations/:id', validateDanceOrganization, catchAsync(async (req, res) => {
    const { id } = req.params;
    const danceOrganization = await DanceOrganization.findByIdAndUpdate(id, { ...req.body.danceOrganization });
    res.redirect(`/danceOrganizations/${danceOrganization._id}`)
}));

app.delete('/danceOrganizations/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await DanceOrganization.findByIdAndDelete(id);
    res.redirect('/danceOrganizations');
}));

app.post('/danceOrganizations/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const danceOrganization = await DanceOrganization.findById(req.params.id);
    const review = new Review(req.body.review);
    danceOrganization.reviews.push(review);
    await review.save();
    await danceOrganization.save();
    res.redirect(`/danceOrganizations/${danceOrganization._id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!'
    res.status(statusCode).render('error', { err })
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})
