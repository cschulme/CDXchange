// --- MODULES ---
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

mongoose.connect('mongodb://localhost/cdxchange', { useNewUrlParser: true });

const db = mongoose.connection;

autoIncrement.initialize(mongoose.connection);



module.exports = db;