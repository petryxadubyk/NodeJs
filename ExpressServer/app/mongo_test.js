
var Db = require('mongodb').Db,
    Connection = require('mongodb').Connection,
    Server = require('mongodb').Server,
    async = require('async');

var host = process.env['MONGO_NODE_DRIVER_HOST'] != null ? process.env['MONGO_NODE_DRIVER_HOST'] : 'localhost';
var port = process.env['MONGO_NODE_DRIVER_PORT'] != null ? process.env['MONGO_NODE_DRIVER_PORT'] : Connection.DEFAULT_PORT;

var db = new Db('PhotoAlbums',
                new Server(host,
                    port,
                    {auto_reconnect: true, poolSize: 20}),
                {w: 1}); //weather Mongo should wait until callbacks come




var docs = [{ _id: "italy2012",
    name:"italy2012",
    title:"Spring Festival in Italy",
    date:"2012/02/15",
    description:"I went to Italy for Spring Festival."
},
    { _id:"australia2010",
        name:"australia2010",
        title:"Vacation Down Under",
        date:"2010/10/20",
        description:"Visiting some friends in Oz!"
    },
    { _id:"japan2010",
        name:"japan2010",
        title:"Programming in Tokyo",
        date:"2010/06/10",
        description:"I worked in Tokyo for a while."
    },
    { _id:"toronto2009",
        name:"toronto2009",
        title:"Programming in Toronto",
        date:"2009/08/10",
        description:"I worked in Toronto for a while."
    }
    ];

var pix = [
    { filename: "picture_01.jpg",
        albumid: "italy2012",
        description: "rome!",
        date: "2012/02/15 16:20:40" },
    { filename: "picture_04.jpg",
        albumid: "italy2012",
        description: "fontana di trevi",
        date: "2012/02/19 16:20:40" },
    { filename: "picture_02.jpg",
        albumid: "italy2012",
        description: "it's the vatican!",
        date: "2012/02/17 16:35:04" },
    { filename: "picture_05.jpg",
        albumid: "italy2012",
        description: "rome!",
        date: "2012/02/19 16:20:40" },
    { filename: "picture_03.jpg",
        albumid: "italy2012",
        description: "spanish steps",
        date: "2012/02/18 16:20:40" },

    { filename: "photo_05.jpg",
        albumid: "japan2010",
        description: "something nice",
        date: "2010/06/14 12:21:40" },
    { filename: "photo_01.jpg",
        albumid: "japan2010",
        description: "tokyo tower!",
        date: "2010/06/11 12:20:40" },
    { filename: "photo_06.jpg",
        albumid: "japan2010",
        description: "kitty cats",
        date: "2010/06/14 12:23:40" },
    { filename: "photo_03.jpg",
        albumid: "japan2010",
        description: "shinjuku is nice",
        date: "2010/06/12 08:80:40" },
    { filename: "photo_04.jpg",
        albumid: "japan2010",
        description: "eating sushi",
        date: "2010/06/12 08:34:40" },
    { filename: "photo_02.jpg",
        albumid: "japan2010",
        description: "roppongi!",
        date: "2010/06/12 07:44:40" },
    { filename: "photo_07.jpg",
        albumid: "japan2010",
        description: "moo cow oink pig woo!!",
        date: "2010/06/15 12:55:40" },

    { filename: "photo_001.jpg",
        albumid: "australia2010",
        description: "sydney!",
        date: "2010/10/20 07:44:40" },
    { filename: "photo_002.jpg",
        albumid: "australia2010",
        description: "asdfasdf!",
        date: "2010/10/20 08:24:40" },
    { filename: "photo_003.jpg",
        albumid: "australia2010",
        description: "qwerqwr!",
        date: "2010/10/20 08:55:40" },
    { filename: "photo_004.jpg",
        albumid: "australia2010",
        description: "zzzxcv zxcv",
        date: "2010/10/21 14:29:40" },
    { filename: "photo_005.jpg",
        albumid: "australia2010",
        description: "ipuoip",
        date: "2010/10/22 19:08:40" },
    { filename: "photo_006.jpg",
        albumid: "australia2010",
        description: "asdufio",
        date: "2010/10/22 22:15:40" }
];

var albums, photos;

async.waterfall([

        function (cb) {
            db.collection("Albums", cb);                      // create collection if it doesn't exists
            //db.collection("Albums", {safe: true}, cb);      // open collection if exists otherwise throw an error
            //db.createCollection("Albums", cb);               // create collection if it doesn't exists
            //db.createCollection("Albums", {safe: true}, cb);// creates collection if it doesn't exists, but throw ab error if exists
        },

        function (albums_coll, cb) {
            albums = albums_coll;
            db.collection('Photos', cb);
        },

        function (photos_coll, cb) {
            photos = photos_coll;
            albums.insert(docs, {safe: true}, cb); //safe:true = make sure that record is written to at least one db before returning callback
        },

        function (docs, cb) {
            albums.update({ _id: 'toronto2009'},
                { $set: {description: "this is the new description"}},
                { safe: true },
            cb);

            /*
            * $set - sets the value of the given field to the given value
            * $inc - Increments the value of the specified field
            * $rename - Renames the specified field to the given name
            * $push - If the field is an array, this pushes a new value to the end of it
            * $pushAll -  If the field is an array, this pushes the given new multiple values to the end of it
            * $pop - Removes the last element of the array field
            * $pull - Removes the given value(s) from an array field
            * */
        },

        function (doc, stats, cb) {
            console.log("updated: " + doc);
            albums.remove({_id: 'toronto2009'}, cb);
        },

        function (stats, cb) {
            for(var i = 0; i < pix.length; i++){
                pix[i]._id = pix[i].albumid + "_" + pix[i].filename;
            }
            photos.insert(pix, {safe: true}, cb);
        },

        function (docs, cb) {
            console.log("Successfully performed all db actions;!");
            console.log("---------------------")

            //READ FROM DB
            //Approach 1
            //albums.find().toArray(cb); //downside - creates store in memory for all read objects
            //albums.find({_id: "italy2012"});
            //albums.find({_id: /^t/}); //anything that starts with a letter 't'
            albums.find({ $or: [{name: /^i/}, { name: /^a/}] })
                .sort({date: -1})
                .skip(2)
                .limit(3)
                .toArray();
            // $ne
            // $lt
            // $lte
            // $gt
            // $gte
            // $in - Matches if the field value is one of the values in the given array of values
            // $nin - Matches if the field value is NOT one of the values in the given array of values
            // $all - Matches if the given field is an array and contains all of the values in the given array of values

            //Approach 2
            albums.find().each(function (err, item) {
                if(item == null){
                    cb(null);
                    return;
                }
                console.log("Got an Item: " + item.name);
            })

            //Approach 3
            var s = albums.find().stream();
            s.on('data', //readable - probably will change until executing
                function (item) {
                    //var item = r.read(); //in case of readable
                    console.log("Got an Item: " + item.name);
                });
            s.on('end', function () {
                cb(null);
            });
        },

        function (found_results, cb) {
            cb(null);
        }
    ],
    //results function
    function (err, results) {
        if(err && err.code == 11000)
            console.log("Duplicate _id!!!");

        db.close();
    });