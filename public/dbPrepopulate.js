// --- MODULES ---
const mongoose = require('mongoose');
const db = require('./db');
const ItemModel = require('./models/item');
const UserModel = require('./models/user');
const UserProfileModel = require('./models/userProfile');
const SwapModel = require('./models/swap');

let cds = [
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

ItemModel.countDocuments({}, (err, count) => {
    if(count == 0) {
        ItemModel.collection.insert(cds, (err, result) => {
            if(err) {
                console.error(err);
            } else {
                console.log("Items collection populated.");
            }
        })
    }
})

let users = [
    { _id: 1, firstName: 'Christian', lastName: 'Schulmeister', email: 'cschulme@uncc.edu', address1: '7429 Quail Wood Dr.', address2: 'Apt. F', city: 'Charlotte', area: 'NC', postalCode: 28226, country: 'USA' },
    { _id: 2, firstName: 'Chase', lastName: 'Farinelli', email: 'chasesoufi@gmail.com', address1: '8213 Autumn Applause Dr.', address2: '', city: 'Charlotte', area: 'NC', postalCode: 28277, country: 'USA' },
    { _id: 3, firstName: 'Katelyn', lastName: 'Schulmeister', email: 'keschulme@gmail.com', address1: '7429 Quail Wood Dr.', address2: 'Apt. F', city: 'Charlotte', area: 'NC', postalCode: 28226, country: 'USA' }
];

UserModel.countDocuments({}, (err, count) => {
    if(count == 0) {
        UserModel.collection.insert(users, (err, result) => {
            if(err) {
                console.error(err);
            } else {
                console.log("Users collection populated.");
            }
        });
    }
})

let userprofiles = [
    { 
        _id: 1, 
        _userId: 1, 
        userItems: [
            { _id: 'TaylorSwift-1989', itemName: '1989', artist: 'Taylor Swift', year: 2014, recordLabel: 'Big Machine', catalogCategory: 'Pop', description: 'On 1989, Taylor Swift fully embraces her shift to synth pop, with stadium-ready anthems and harrowing ballads.', rating: 4 },
            { _id: 'TroyeSivan-Bloom', itemName: 'Bloom', artist: 'Troye Sivan', year: 2018, recordLabel: 'EMI Australia', catalogCategory: 'Pop', description: '', rating: 5 },
            { _id: 'WalkTheMoon-TalkingIsHard', itemName: 'Talking is Hard', artist: 'Walk the Moon', year: 2014, recordLabel: 'RCA Records', catalogCategory: 'Alternative', description: '', rating: 4 }
        ]
    }, {
        _id: 2,
        _userId: 2,
        userItems: [
            { _id: 'PinkFloyd-DarkSideOfTheMoon', itemName: 'Dark Side of the Moon', artist: 'Pink Floyd', year: 1973, recordLabel: 'Harvest', catalogCategory: 'Rock', description: '', rating: 5 },
            { _id: 'KendrickLamar-ToPimpAButterfly', itemName: 'To Pimp A Butterfly', artist: 'Kendrick Lamar', year: 2015, recordLabel: 'Aftermath Entertainment', catalogCategory: 'Rap', description: '', rating: 5 },
            { _id: 'Nirvana-InUtero', itemName: 'In Utero', artist: 'Nirvana', year: 1993, recordLabel: 'DGC', catalogCategory: 'Alternative', description: '', rating: 4 }
        ]
    }, {
        _id: 3,
        _userId: 3,
        userItems: [
            { _id: 'BlackSabbath-MasterOfReality', itemName: 'Master of Reality', artist: 'Black Sabbath', year: 1971, recordLabel: 'Vertigo Records', catalogCategory: 'Metal', description: '', rating: 3 },
            { _id: 'Eminem-Kamikaze', itemName: 'Kamikaze', artist: 'Eminem', year: 2018, recordLabel: 'Aftermath Entertainment', catalogCategory: 'Rap', description: '', rating: 5 },
            { _id: 'Anthrax-FistfulOfMetal', itemName: 'Fistful of Metal', artist: 'Anthrax', year: 1984, recordLabel: 'Banzai Records', catalogCategory: 'Metal', description: '', rating: 4 }
        ]
    }
];

UserProfileModel.countDocuments({}, (err, count) => {
    if(count == 0) {
        UserProfileModel.collection.insert(userprofiles, (err, result) => {
            if(err) {
                console.error(err);
            } else {
                console.log("UserProfiles collection populated.");
            }
        });
    }
})

let swaps = new Array();

for(var i = 0; i < 9; i++) {
    if( i / 3 == 0) {
        userprofiles[0].userItems.forEach((item) => {
            swapHolder = {
                _id: '1-' + item._id,
                _userId: 1,
                item: item,
                userRating: item.rating,
                status: 'Available',
                _swapUserId: undefined,
                swapItem: undefined,
                swapItemRating: undefined,
                swapUserRating: undefined
            }

            swaps.push(swapHolder);
        });
    } else if ( i / 3 == 1) {
        userprofiles[1].userItems.forEach((item) => {
            swapHolder = {
                _id: '2-' + item._id,
                _userId: 2,
                item: item,
                userRating: item.rating,
                status: 'Available',
                _swapUserId: undefined,
                swapItem: undefined,
                swapItemRating: undefined,
                swapUserRating: undefined
            }

            swaps.push(swapHolder);
        });
    } else {
        userprofiles[2].userItems.forEach((item) => {
            swapHolder = {
                _id: '3-' + item._id,
                _userId: 3,
                item: item,
                userRating: item.rating,
                status: 'Available',
                _swapUserId: undefined,
                swapItem: undefined,
                swapItemRating: undefined,
                swapUserRating: undefined
            }

            swaps.push(swapHolder);
        });
    }
}

SwapModel.countDocuments({}, (err, count) => {
    if(count == 0) {
        SwapModel.collection.insert(swaps, (err, result) => {
            if(err) {
                console.error(err);
            } else {
                console.log("Swaps collection populated.");
            }
        });
    }
})