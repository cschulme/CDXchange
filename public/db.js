// --- MODULES ---
const mongoose = require('mongoose');
const autoIncrement = require('mongoose-auto-increment');

mongoose.connect('mongodb://localhost/cdxchange', { useNewUrlParser: true });

// --- CONFIGURE ---
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

const db = mongoose.connection;

autoIncrement.initialize(mongoose.connection);

module.exports = db;