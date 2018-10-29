// --- MODULES ---
const db = require('../db');
const mongoose = require('mongoose');

// --- MODEL ---
const ItemSchema = new mongoose.Schema({
    // ItemCode.
    _id: String,
    itemName: String,
    artist: String,
    year: Number,
    recordLabel: String,
    catalogCategory: String,
    description: String,
    rating: {
        type: Number,
        min: 0,
        max: 5
    }
}, {
    toObject: {
        virtuals: true
    },
    toJson: {
        virtuals: true
    }
});

ItemSchema.virtual('imageURL').get(function() {
    return '/Images/AlbumCovers/' + this._id + '.jpg';
});

const Item = db.model('Item', ItemSchema);

// Make sure DB is populated.
var CDs = [
    { _id: 'TaylorSwift-1989', itemName: '1989', artist: 'Taylor Swift', year: 2014, recordLabel: 'Big Machine', catalogCategory: 'Pop', description: 'On 1989, Taylor Swift fully embraces her shift to synth pop, with stadium-ready anthems and harrowing ballads.', rating: 4 },
    { _id: 'TaylorSwift-Reputation', itemName: 'Reputation', artist: 'Taylor Swift', year: 2017, recordLabel: 'Big Machine', catalogCategory: 'Pop', description: '', rating: 3 },
    { _id: 'TroyeSivan-Bloom', itemName: 'Bloom', artist: 'Troye Sivan', year: 2018, recordLabel: 'EMI Australia', catalogCategory: 'Pop', description: '', rating: 5 },
    { _id: 'CharliXCX-Pop2', itemName: 'Pop 2', artist: 'Charli XCX', year: 2017, recordLabel: 'Asylum', catalogCategory: 'Pop', description: '', rating: 4},
    { _id: 'WalkTheMoon-TalkingIsHard', itemName: 'Talking is Hard', artist: 'Walk the Moon', year: 2014, recordLabel: 'RCA Records', catalogCategory: 'Alternative', description: '', rating: 4 },
    { _id: 'FooFighters-TheColourAndTheShape', itemName: 'The Colour and the Shape', artist: 'Foo Fighters', year: 1997, recordLabel: 'Capitol Records', catalogCategory: 'Alternative', description: '', rating: 5 },
    { _id: 'Nirvana-InUtero', itemName: 'In Utero', artist: 'Nirvana', year: 1993, recordLabel: 'DGC', catalogCategory: 'Alternative', description: '', rating: 4 },
    { _id: 'PinkFloyd-DarkSideOfTheMoon', itemName: 'Dark Side of the Moon', artist: 'Pink Floyd', year: 1973, recordLabel: 'Harvest', catalogCategory: 'Rock', description: '', rating: 5 },
    { _id: 'PinkFloyd-WishYouWereHere', itemName: 'Wish You Were Here', artist: 'Pink Floyd', year: 1975, recordLabel: 'Columbia Records', catalogCategory: 'Rock', description: '', rating: 4 },
    { _id: 'PinkFloyd-TheWall', itemName: 'The Wall', artist: 'Pink Floyd', year: 1977, recordLabel: 'Harvest', catalogCategory: 'Rock', description: '', rating: 5 },
    { _id: 'JasonAldean-RearviewTown', itemName: 'Rearview Town', artist: 'Jason Aldean', year: 2018, recordLabel: 'Sony Music CG', catalogCategory: 'Country', description: '', rating: 4 },
    { _id: 'DevinDawson-DarkHorse', itemName: 'Dark Horse', artist: 'Devin Dawson', year: 2018, recordLabel: 'Warner Bros. Records', catalogCategory: 'Country', description: '', rating: 3 },
    { _id: 'KaceyMusgraves-PageantMaterial', itemName: 'Pageant Material', artist: 'Kacey Musgraves', year: 2015, recordLabel: 'Universal Music Group Nashville', catalogCategory: 'Country', description: '', rating: 5 },
    { _id: 'Eminem-Kamikaze', itemName: 'Kamikaze', artist: 'Eminem', year: 2018, recordLabel: 'Aftermath Entertainment', catalogCategory: 'Rap', description: '', rating: 5 },
    { _id: 'KendrickLamar-ToPimpAButterfly', itemName: 'To Pimp A Butterfly', artist: 'Kendrick Lamar', year: 2015, recordLabel: 'Aftermath Entertainment', catalogCategory: 'Rap', description: '', rating: 5 },
    { _id: 'NWA-StraightOuttaCompton', itemName: 'Straight Outta Compton', artist: 'N.W.A', year: 1988, recordLabel: 'Ruthless Records', catalogCategory: 'Rap', description: '', rating: 4},
    { _id: 'Metallica-MasterOfPuppets', itemName: 'Master of Puppets', artist: 'Metallica', year: 1986, recordLabel: 'Elektra Records', catalogCategory: 'Metal', description: '', rating: 4 },
    { _id: 'BlackSabbath-MasterOfReality', itemName: 'Master of Reality', artist: 'Black Sabbath', year: 1971, recordLabel: 'Vertigo Records', catalogCategory: 'Metal', description: '', rating: 3 },
    { _id: 'Anthrax-FistfulOfMetal', itemName: 'Fistful of Metal', artist: 'Anthrax', year: 1984, recordLabel: 'Banzai Records', catalogCategory: 'Metal', description: '', rating: 4 }
];

Item.countDocuments({}, function(err, count) {
    Item.find(function(err, result) {
        console.log(result);
    });

    if(count == 0) {
        console.log("Item count == 0.");
        Item.collection.insert(CDs, function(err, result) {
            if(err) {
                return console.error(err);
            } else {
                console.log("Item collection populated.");
            }
        });
    }
});

module.exports = Item;