// --- MODULES ---
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/cdxchange');

const db = mongoose.connection;

module.exports = db;