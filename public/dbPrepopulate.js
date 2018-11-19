// --- MODULES ---
const mongoose = require('mongoose');
const db = require('./db');
const ItemModel = require('./models/Item');
const UserModel = require('./models/User');
const OfferModel = require('./models/Offer');

/*
 * Resets and populates the database.
 */
module.exports.resetDb = () => {
    // Clear items collection.
    ItemModel.Items.deleteMany({}).exec()
        // Clear users collection.
        .then(() => {
            console.log("Item collection emptied.");
            UserModel.Users.deleteMany({}).exec();
        })
        // Clear swaps collection.
        .then(() => {
            console.log("User collection emptied.");
            OfferModel.Offers.deleteMany({}).exec();
        })
        // Status update.
        .then(() => {
            console.log("Offer collection empited.");
            console.log("Beginning database population...");
        })
        // Populate items collection.
        .then(() => {
            let cds = [
                { _id: 'TaylorSwift-1989', itemName: '1989', artist: 'Taylor Swift', year: 2014, recordLabel: 'Big Machine', catalogCategory: 'Pop', description: 'On 1989, Taylor Swift fully embraces her shift to synth pop, with stadium-ready anthems and harrowing ballads.', rating: 4,
                    tracks: [
                        { number: 1, title: 'Welcome To New York', artists: ['Taylor Swift'], length: '3:32' },
                        { number: 2, title: 'Blank Space', artists: ['Taylor Swift'], length: '3:51' },
                        { number: 3, title: 'Style', artists: ['Taylor Swift'], length: '3:51' },
                        { number: 4, title: 'Out Of The Woods', artists: ['Taylor Swift'], length: '3:55' },
                        { number: 5, title: 'All You Had To Do Was Stay', artists: ['Taylor Swift'], length: '3:13' },
                        { number: 6, title: 'Shake It Off', artists: ['Taylor Swift'], length: '3:39' },
                        { number: 7, title: 'I Wish You Would', artists: ['Taylor Swift'], length: '3:27' },
                        { number: 8, title: 'Bad Blood', artists: ['Taylor Swift'], length: '3:31' },
                        { number: 9, title: 'Wildest Dreams', artists: ['Taylor Swift'], length: '3:40' },
                        { number: 10, title: 'How You Get The Girl', artists: ['Taylor Swift'], length: '4:07' },
                        { number: 11, title: 'This Love', artists: ['Taylor Swift'], length: '4:10' },
                        { number: 12, title: 'I Know Places', artists: ['Taylor Swift'], length: '3:15' },
                        { number: 13, title: 'Clean', artists: ['Taylor Swift'], length: '4:31' }
                    ]
                },
                { _id: 'TaylorSwift-Reputation', itemName: 'Reputation', artist: 'Taylor Swift', year: 2017, recordLabel: 'Big Machine', catalogCategory: 'Pop', description: '', rating: 3,
                    tracks: [
                        { number: 1, title: '...Ready for It?', artists: ['Taylor Swift'], length: '3:28' },
                        { number: 2, title: 'End Game', artists: ['Taylor Swift', 'Ed Sheeran', 'Future'], length: '4:04' },
                        { number: 3, title: 'I Did Something Bad', artists: ['Taylor Swift'], length: '3:58' },
                        { number: 4, title: 'Don\'t Blame Me', artists: ['Taylor Swift'], length: '3:56' },
                        { number: 5, title: 'Delicate', artists: ['Taylor Swift'], length: '3:52' },
                        { number: 6, title: 'Look What You Made Me Do', artists: ['Taylor Swift'], length: '3:31' },
                        { number: 7, title: 'So It Goes...', artists: ['Taylor Swift'], length: '3:47' },
                        { number: 8, title: 'Gorgeous', artists: ['Taylor Swift'], length: '3:29' },
                        { number: 9, title: 'Getaway Car', artists: ['Taylor Swift'], length: '3:53' },
                        { number: 10, title: 'King of My Heart', artists: ['Taylor Swift'], length: '3:34' },
                        { number: 11, title: 'Dancing with Our Hands Tied', artists: ['Taylor Swift'], length: '3:31' },
                        { number: 12, title: 'Dress', artists: ['Taylor Swift'], length: '3:50' },
                        { number: 13, title: 'This Is Why We Can\'t Have Nice Things', artists: ['Taylor Swift'], length: '3:27' },
                        { number: 14, title: 'Call It What You Want', artists: ['Taylor Swift'], length: '3:23' },
                        { number: 15, title: 'New Year\'s Day', artists: ['Taylor Swift'], length: '3:55' }
                    ]
                },
                { _id: 'TroyeSivan-Bloom', itemName: 'Bloom', artist: 'Troye Sivan', year: 2018, recordLabel: 'EMI Australia', catalogCategory: 'Pop', description: 'Pulling inspiration from Bowie to Madonna, Bloom reimagines glam in the 21st century.', rating: 5,
                    tracks: [
                        { number: 1, title: 'Seventeen', artists: ['Troye Sivan'], length: '3:38' },
                        { number: 2, title: 'My My My!', artists: ['Troye Sivan'], length: '3:25' },
                        { number: 3, title: 'The Good Side', artists: ['Troye Sivan'], length: '4:29' },
                        { number: 4, title: 'Bloom', artists: ['Troye Sivan'], length: '3:42' },
                        { number: 5, title: 'Postcard', artists: ['Troye Sivan', 'Gordi'], length: '3:37' },
                        { number: 6, title: 'Dance To This', artists: ['Troye Sivan', 'Ariana Grande'], length: '3:52' },
                        { number: 7, title: 'Plum', artists: ['Troye Sivan'], length: '3:06' },
                        { number: 8, title: 'What A Heavenly Way To Die', artists: ['Troye Sivan'], length: '3:08' },
                        { number: 9, title: 'Lucky Strike', artists: ['Troye Sivan'], length: '3:29' },
                        { number: 10, title: 'Animal', artists: ['Troye Sivan'], length: '4:25' }
                    ]
                },
                { _id: 'CharliXCX-Pop2', itemName: 'Pop 2', artist: 'Charli XCX', year: 2017, recordLabel: 'Asylum', catalogCategory: 'Pop', description: 'The second of a 2 part mixtape collection, Pop 2 features party bangers with collaboraters from Tove Lo to CupcakKe.', rating: 4,
                    tracks: [
                        { number: 1, title: 'Backseat', artists: ['Charli XCX', 'Carly Rae Jepsen'], length: '3:58' },
                        { number: 2, title: 'Out Of My Head', artists: ['Charli XCX', 'Carly Rae Jepsen', 'Alma'], length: '3:56' },
                        { number: 3, title: 'Lucky', artists: ['Charli XCX'], length: '3:36' },
                        { number: 4, title: 'Tears', artists: ['Charli XCX', 'Caroline Polachek'], length: '4:14' },
                        { number: 5, title: 'I Got It', artists: ['Charli XCX', 'Pabllo Vittar', 'CupcakKe', 'Brooke Candy'], length: '3:52' },
                        { number: 6, title: 'Femmebot', artists: ['Charli XCX', 'Mykki Blanco', 'Dorian Electra'], length: '3:38' },
                        { number: 7, title: 'Delicious', artists: ['Charli XCX', 'Tommy Case'], length: '4:33' },
                        { number: 8, title: 'Unlock It', artists: ['Charli XCX', 'Jay Park', 'Kim Petras'], length: '3:53' },
                        { number: 9, title: 'Porsche', artists: ['Charli XCX', 'MØ'], length: '3:27' },
                        { number: 10, title: 'Track 10', artists: ['Charli XCX'], length: '5:26' }
                    ]
                },
                { _id: 'WalkTheMoon-TalkingIsHard', itemName: 'Talking is Hard', artist: 'Walk the Moon', year: 2014, recordLabel: 'RCA Records', catalogCategory: 'Alternative', description: '', rating: 4,
                    tracks: [
                        { number: 1, title: 'Different Colors', artists: ['Walk The Moon'], length: '3:42' },
                        { number: 2, title: 'Sidekick', artists: ['Walk The Moon'], length: '2:55' },
                        { number: 3, title: 'Shut Up and Dance', artists: ['Walk The Moon'], length: '3:18' },
                        { number: 4, title: 'Up 2 U', artists: ['Walk The Moon'], length: '3:23' },
                        { number: 5, title: 'Avalanche', artists: ['Walk The Moon'], length: '3:40' },
                        { number: 6, title: 'Portugal', artists: ['Walk The Moon'], length: '4:01' },
                        { number: 7, title: 'Down in the Dumps', artists: ['Walk The Moon'], length: '4:25' },
                        { number: 8, title: 'Work This Body', artists: ['Walk The Moon'], length: '2:57' },
                        { number: 9, title: 'Spend Your $$$', artists: ['Walk The Moon'], length: '3:22' },
                        { number: 10, title: 'We Are the Kids', artists: ['Walk The Moon'], length: '3:37' },
                        { number: 11, title: 'Come Under the Covers', artists: ['Walk The Moon'], length: '3:51' },
                        { number: 12, title: 'Aquaman', artists: ['Walk The Moon'], length: '3:59' }
                    ]
                },
                { _id: 'FooFighters-TheColourAndTheShape', itemName: 'The Colour and the Shape', artist: 'Foo Fighters', year: 1997, recordLabel: 'Capitol Records', catalogCategory: 'Alternative', description: '', rating: 5 },
                { _id: 'Nirvana-InUtero', itemName: 'In Utero', artist: 'Nirvana', year: 1993, recordLabel: 'DGC', catalogCategory: 'Alternative', description: '', rating: 4,
                    tracks: [
                        { number: 1, title: 'Serve the Servants', artists: ['Nirvana'], length: '3:36' },
                        { number: 2, title: 'Scentless Apprentice', artists: ['Nirvana'], length: '3:48' },
                        { number: 3, title: 'Heart-Shaped Box', artists: ['Nirvana'], length: '4:41' },
                        { number: 4, title: 'Rape Me', artists: ['Nirvana'], length: '2:50' },
                        { number: 5, title: 'Frances Farmer Will Have Her Revenge on Seattle', artists: ['Nirvana'], length: '4:09' },
                        { number: 6, title: 'Dumb', artists: ['Nirvana'], length: '2:32' },
                        { number: 7, title: 'Very Ape', artists: ['Nirvana'], length: '1:56' },
                        { number: 8, title: 'Milk It', artists: ['Nirvana'], length: '3:55' },
                        { number: 9, title: 'Pennyroyal Tea', artists: ['Nirvana'], length: '3:37' },
                        { number: 10, title: 'Radio Friendly Unit Shifter', artists: ['Nirvana'], length: '4:51' },
                        { number: 11, title: 'tourette\'s', artists: ['Nirvana'], length: '1:35' },
                        { number: 12, title: 'All Apologies', artists: ['Nirvana'], length: '3:51' }
                    ]
                },
                { _id: 'PinkFloyd-DarkSideOfTheMoon', itemName: 'Dark Side of the Moon', artist: 'Pink Floyd', year: 1973, recordLabel: 'Harvest', catalogCategory: 'Rock', description: '', rating: 5,
                    tracks: [
                        { number: 1, title: 'Speak to Me', artists: ['Pink Floyd'], length: '1:30' },
                        { number: 2, title: 'Breathe', artists: ['Pink Floyd'], length: '2:43' },
                        { number: 3, title: 'On the Run', artists: ['Pink Floyd'], length: '3:30' },
                        { number: 4, title: 'Time/Breathe (Reprise)', artists: ['Pink Floyd'], length: '6:53' },
                        { number: 5, title: 'The Great Gig in the Sky', artists: ['Pink Floyd'], length: '4:15' },
                        { number: 6, title: 'Money', artists: ['Pink Floyd'], length: '6:30' },
                        { number: 7, title: 'Us and Them', artists: ['Pink Floyd'], length: '7:51' },
                        { number: 8, title: 'Any Colour You Like', artists: ['Pink Floyd'], length: '3:24' },
                        { number: 9, title: 'Brain Damage', artists: ['Pink Floyd'], length: '3:50' },
                        { number: 10, title: 'Eclipse', artists: ['Pink Floyd'], length: '2:03' }
                    ]
                },
                { _id: 'PinkFloyd-WishYouWereHere', itemName: 'Wish You Were Here', artist: 'Pink Floyd', year: 1975, recordLabel: 'Columbia Records', catalogCategory: 'Rock', description: '', rating: 4,
                    tracks: [
                        { number: 1, title: 'Shine On You Crazy Diamond, Parts I-V', artists: ['Pink Floyd'], length: '13:19' },
                        { number: 2, title: 'Welcome to the Machine', artists: ['Pink Floyd'], length: '7:27' },
                        { number: 3, title: 'Have a Cigar', artists: ['Pink Floyd'], length: '5:08' },
                        { number: 4, title: 'Wish You Were Here', artists: ['Pink Floyd'], length: '5:40' },
                        { number: 5, title: 'Shine On You Crazy Diamond, Parts VI-IX', artists: ['Pink Floyd'], length: '12:23' }
                    ]
                },
                { _id: 'PinkFloyd-TheWall', itemName: 'The Wall', artist: 'Pink Floyd', year: 1977, recordLabel: 'Harvest', catalogCategory: 'Rock', description: '', rating: 5 },
                { _id: 'JasonAldean-RearviewTown', itemName: 'Rearview Town', artist: 'Jason Aldean', year: 2018, recordLabel: 'Sony Music CG', catalogCategory: 'Country', description: '', rating: 4 },
                { _id: 'DevinDawson-DarkHorse', itemName: 'Dark Horse', artist: 'Devin Dawson', year: 2018, recordLabel: 'Warner Bros. Records', catalogCategory: 'Country', description: '', rating: 3 },
                { _id: 'KaceyMusgraves-PageantMaterial', itemName: 'Pageant Material', artist: 'Kacey Musgraves', year: 2015, recordLabel: 'Universal Music Group Nashville', catalogCategory: 'Country', description: '', rating: 5 },
                { _id: 'Eminem-Kamikaze', itemName: 'Kamikaze', artist: 'Eminem', year: 2018, recordLabel: 'Aftermath Entertainment', catalogCategory: 'Rap', description: '', rating: 5,
                    tracks: [
                        { number: 1, title: 'The Ringer', artists: ['Eminem'], length: '5:37' },
                        { number: 2, title: 'Greatest', artists: ['Eminem'], length: '3:46' },
                        { number: 3, title: 'Lucky You', artists: ['Eminem', 'Joyner Lucas'], length: '4:04' },
                        { number: 4, title: 'Paul (Skit)', artists: ['Eminem', 'Paul Rosenberg'], length: '0:35' },
                        { number: 5, title: 'Normal', artists: ['Eminem'], length: '3:42' },
                        { number: 6, title: 'Em Calls Paul (Skit)', artists: ['Eminem'], length: '0:49' },
                        { number: 7, title: 'Stepping Stone', artists: ['Eminem'], length: '5:09' },
                        { number: 8, title: 'Not Alike', artists: ['Eminem', 'Royce da 5\'9"'], length: '4:48' },
                        { number: 9, title: 'Kamikaze', artists: ['Eminem'], length: '3:36' },
                        { number: 10, title: 'Fall', artists: ['Eminem'], length: '4:22' },
                        { number: 11, title: 'Nice Guy', artists: ['Eminem', 'Jessie Reyez'], length: '2:30' },
                        { number: 12, title: 'Good Guy', artists: ['Eminem', 'Jessie Reyez'], length: '2:22' },
                        { number: 13, title: 'Venom (Music from the Motion Picture)', artists: ['Eminem'], length: '4:29' }
                    ]
                },
                { _id: 'KendrickLamar-ToPimpAButterfly', itemName: 'To Pimp A Butterfly', artist: 'Kendrick Lamar', year: 2015, recordLabel: 'Aftermath Entertainment', catalogCategory: 'Rap', description: '', rating: 5,
                    tracks: [
                        { number: 1, title: 'Wesley\'s Theory', artists: ['Kendrick Lamar', 'George Clinton', 'Thundercat'], length: '4:47' },
                        { number: 2, title: 'For Free? (Interlude)', artists: ['Kendrick Lamar'], length: '2:10' },
                        { number: 3, title: 'King Kunta', artists: ['Kendrick Lamar'], length: '3:54' },
                        { number: 4, title: 'Institutionalized', artists: ['Kendrick Lamar', 'Bilal', 'Anna Wise', 'Snoop Dogg'], length: '4:31' },
                        { number: 5, title: 'These Walls', artists: ['Kendrick Lamar', 'Bilal', 'Anna Wise', 'Thundercat'], length: '5:00' },
                        { number: 6, title: 'u', artists: ['Kendrick Lamar'], length: '4:28' },
                        { number: 7, title: 'Alright', artists: ['Kendrick Lamar'], length: '3:39' },
                        { number: 8, title: 'For Sale? (Interlude)', artists: ['Kendrick Lamar'], length: '4:51' },
                        { number: 9, title: 'Momma', artists: ['Kendrick Lamar'], length: '4:43' },
                        { number: 10, title: 'Hood Politics', artists: ['Kendrick Lamar'], length: '4:52' },
                        { number: 11, title: 'How Much a Dollar Cost', artists: ['Kendrick Lamar', 'James Fauntleroy', 'Ronald Isley'], length: '4:21' },
                        { number: 12, title: 'Complexion (A Zulu Love)', artists: ['Kendrick Lamar', 'Rapsody'], length: '4:23' },
                        { number: 13, title: 'The Blacker the Berry', artists: ['Kendrick Lamar'], length: '5:28' },
                        { number: 14, title: 'You Ain\'t Gotta Lie (Momma Said)', artists: ['Kendrick Lamar'], length: '4:01' },
                        { number: 15, title: 'i', artists: ['Kendrick Lamar'], length: '5:36' },
                        { number: 16, title: 'Mortal Man', artists: ['Kendrick Lamar'], length: '12:07' }
                    ]
                },
                { _id: 'NWA-StraightOuttaCompton', itemName: 'Straight Outta Compton', artist: 'N.W.A', year: 1988, recordLabel: 'Ruthless Records', catalogCategory: 'Rap', description: '', rating: 4},
                { _id: 'Metallica-MasterOfPuppets', itemName: 'Master of Puppets', artist: 'Metallica', year: 1986, recordLabel: 'Elektra Records', catalogCategory: 'Metal', description: '', rating: 4 },
                { _id: 'BlackSabbath-MasterOfReality', itemName: 'Master of Reality', artist: 'Black Sabbath', year: 1971, recordLabel: 'Vertigo Records', catalogCategory: 'Metal', description: '', rating: 3,
                    tracks: [
                        { number: 1, title: 'Sweet Leaf', artists: ['Black Sabbath'], length: '5:05' },
                        { number: 2, title: 'After Forever', artists: ['Black Sabbath'], length: '5:27' },
                        { number: 3, title: 'Embryo (Instrumental)', artists: ['Black Sabbath'], length: '0:28' },
                        { number: 4, title: 'Children of the Grave', artists: ['Black Sabbath'], length: '5:18' },
                        { number: 5, title: 'Orchid (Instrumental)', artists: ['Black Sabbath'], length: '1:31' },
                        { number: 6, title: 'Lord of This World', artists: ['Black Sabbath'], length: '5:27' },
                        { number: 7, title: 'Solitude', artists: ['Black Sabbath'], length: '5:02' },
                        { number: 8, title: 'Into the Void', artists: ['Black Sabbath'], length: '6:13' }
                    ]
                },
                { _id: 'Anthrax-FistfulOfMetal', itemName: 'Fistful of Metal', artist: 'Anthrax', year: 1984, recordLabel: 'Banzai Records', catalogCategory: 'Metal', description: '', rating: 4,
                    tracks: [
                        { number: 1, title: 'Deathrider', artists: ['Anthrax'], length: '3:10' },
                        { number: 2, title: 'Metal Thrasing Mad', artists: ['Anthrax'], length: '2:39' },
                        { number: 3, title: 'I\'m Eighteen (Alice Cooper cover)', artists: ['Anthrax'], length: '4:02' },
                        { number: 4, title: 'Panic', artists: ['Anthrax'], length: '3:58' },
                        { number: 5, title: 'Subjugator', artists: ['Anthrax'], length: '4:38' },
                        { number: 6, title: 'Soldiers of Metal', artists: ['Anthrax'], length: '2:55' },
                        { number: 7, title: 'Death from Above', artists: ['Anthrax'], length: '5:00' },
                        { number: 8, title: 'Anthrax', artists: ['Anthrax'], length: '3:24' },
                        { number: 9, title: 'Across the River (Instrumental)', artists: ['Anthrax'], length: '1:26' },
                        { number: 10, title: 'Howling Furies', artists: ['Anthrax'], length: '3:55' }
                    ]
                }
            ];

            ItemModel.Items.collection.insertMany(cds, (err, result) => {
                console.log("Items collection populated.");
            })
        })
        // Populate users collection.
        .then(() => {
            let users = [
                { 
                    _id: 1, 
                    firstName: 'Christian', 
                    lastName: 'Schulmeister', 
                    email: 'cschulme@uncc.edu', 
                    address: {
                        address1: '7429 Quail Wood Dr.', 
                        address2: 'Apt. F', 
                        city: 'Charlotte', 
                        area: 'NC', 
                        postalCode: 28226, 
                        country: 'USA'
                    },
                    username: 'cschulme',
                    password: 'password',
                    userItems: [
                        'TaylorSwift-1989',
                        'TroyeSivan-Bloom',
                        'WalkTheMoon-TalkingIsHard'
                    ]
                }, { 
                    _id: 2, 
                    firstName: 'Chase', 
                    lastName: 'Farinelli', 
                    email: 'chasesoufi@gmail.com', 
                    address: {
                        address1: '8213 Autumn Applause Dr.', 
                        address2: '', 
                        city: 'Charlotte', 
                        area: 'NC', 
                        postalCode: 28277, 
                        country: 'USA'
                    },
                    username: 'chasesoufi',
                    password: 'hihihi',
                    userItems: [
                        'PinkFloyd-DarkSideOfTheMoon',
                        'KendrickLamar-ToPimpAButterfly',
                        'Nirvana-InUtero'
                    ]
                }, { 
                    _id: 3, 
                    firstName: 'Katelyn', 
                    lastName: 'Schulmeister', 
                    email: 'keschulme@gmail.com', 
                    address: {
                        address1: '7429 Quail Wood Dr.', 
                        address2: 'Apt. F', 
                        city: 'Charlotte', 
                        area: 'NC', 
                        postalCode: 28226, 
                        country: 'USA'
                    },
                    username: 'pinkpheonix',
                    password: '12345',
                    userItems: [
                        'BlackSabbath-MasterOfReality',
                        'Eminem-Kamikaze',
                        'Anthrax-FistfulOfMetal'
                    ]
                }
            ];

            UserModel.Users.collection.insertMany(users, (err, result) => {
                console.log("Users collection populated.");
            });
        })
        // Populate offers collection.
        .then(() => {
            let offers = [
                {
                    _id: 1,
                    _userId: 2,
                    _ownedItemId: 'KendrickLamar-ToPimpAButterfly',
                    _wantedItemId: 'TaylorSwift-1989',
                    _otherUserId: undefined,
                    status: 'Available'
                }, {
                    _id: 2,
                    _userId: 1,
                    _ownedItemId: 'TroyeSivan-Bloom',
                    _wantedItemId: 'Eminem-Kamikazee',
                    _otherUserId: 3,
                    status: 'Pending'
                }
            ];

            OfferModel.Offers.collection.insertMany(offers, (err, result) => {
                console.log("Offer collection populated.");
            })
        })
        // Handle any errors.
        .then(undefined, (err) => {
            console.log("An error in db populating occured.");
        });
}

/*
 * Drops the database.
 */
module.exports.dropDb = () => {
    // Clear items collection.
    ItemModel.Items.deleteMany({})
        // Clear users collection.
        .then(() => {
            console.log("Item collection emptied.");
            UserModel.Users.deleteMany({});
        })
        // Clear swaps collection.
        .then(() => {
            console.log("User collection emptied.");
            OfferModel.Offers.deleteMany({});
        })
        // Status update.
        .then(() => {
            console.log("Offer collection empited.");
        })
}