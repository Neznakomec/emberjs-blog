/**
 * Created by Ershov on 17.02.2015.
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