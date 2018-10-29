// --- MODULES ---
var express = require('express');
var app = module.exports = express();

// --- ROUTES ---
app.get('/', function (req, res) {
    res.render('index', { title: "CDXchange | Home" });
});

app.get('/artists', function (req, res) {
    res.render('artists', { title: "CDXchange | Artists" });
});

app.get('/about', function (req, res) {
    res.render('about', { title: "CDXchange | About" });
});

app.get('/contact', function (req, res) {
    res.render('contact', { title: "CDXchange | Contact" });
});