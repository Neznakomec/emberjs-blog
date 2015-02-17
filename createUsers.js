/**
 * Created by Ershov on 12.02.2015.
 */


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