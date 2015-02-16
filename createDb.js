/**
 * Created by Ershov on 12.02.2015.
 */
/*var MongoClient = require('mongodb').MongoClient
    , format = require('util').format;

// Connection URL
var url = 'mongodb://localhost:27017/test';
// Use connect method to connect to the Server
MongoClient.connect(url, function(err, db) {
    if (err) throw err;

    var collection = db.collection('test_insert');
    collection.remove({}, function(err, results, mm) {
        if (err) throw err;

    collection.insert({a:2}, function(err, docs) {

        collection.count(function(err, count){
            console.log(format("count = %s", count));
        });

        // Locate all the entries using find
        var cursor  = collection.find({a: 2});
        cursor.toArray(function(err, results) {
            console.dir(results);
            // Let's close the db
            db.close();
        });
    });


    });
});*/

/*
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/test');

var schema = mongoose.Schema({
    name: String
});

schema.methods.meow = function () {
    console.log(this.get('name'));
};

var Cat = mongoose.model('Cat', schema);

var kitty = new Cat({ name: 'Zildjian' });

console.log(kitty);

kitty.save(function (err, kitty, affected) {
        kitty.meow();
});*/

var mongoose = require('dblibs/mongoose');
var User = require('models/user').User;
var async = require('async');

mongoose.connection.on('open', function () {

    var db = mongoose.connection.db;
    db.collection('users').drop(function (err) {
        if (err) throw err;

        async.parallel([
            function (callback) {
                var vasya = new User({_id: 1, username: 'ember', password: 'casts'});
                vasya.save(function (err) {
                    callback(err, vasya);
                });
            },

            function (callback) {
                var petya = new User({_id: 2, username: 'Петя', password: '124'});
                petya.save(function (err) {
                    callback(err, petya);
                });
            },

            function (callback) {
                var admin = new User({_id: 3, username: 'admin', password: 'root'});
                admin.save(function (err) {
                    callback(err, admin);
                });
            }
        ], function (err, results) {
            console.log(arguments);
            mongoose.disconnect();
        })
    })
});