// --- MODULES --
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
const db = require('./db');
const item = require('./models/item');
const staticController = require('./controllers/staticController');
const profileController = require('./controllers/profileController');
const catalogController = require('./controllers/catalogController');


// Create app object.
const app = express();

// --- CONFIGURE ---
app.use(cookieParser());
app.use(session({ secret: "Secret Code" }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'assets')));

// --- ROUTES ---
app.use(staticController);
app.use(profileController);
app.use(catalogController);

// 404 Route
app.use(function(req, res, next){
    res.status(404).render('404', {title: "CDXchange | 404: Page Not Found"});
});

// Listens for requests on port 3000
app.listen(3000, function () {
    console.log('Server ready on port 3000.');
});