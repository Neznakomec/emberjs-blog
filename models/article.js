/**
 * Created by Ershov on 14.02.2015.
 */
var md5 = require('md5');

var mongoose = require('dblibs/mongoose');
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    _id: {
        type: Number,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    author: {
        name: {
        type: String,
        required: true
        }
    },
    excerpt: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

schema.methods.encryptPassword = function (password) {
    // return md5(password + salt);
    return md5(password);
};

schema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() {
        return this._plainPassword;
    });

schema.methods.checkPassword = function (password) {
    return this.encryptPassword(password) == this.hashedPassword;
}


exports.Article = mongoose.model('Article', schema);
var Article = exports.Article;

// auto increment plugin
//
Article.findOne().sort('-_id').exec(function(err, item) {
    var nextArticleNumber;
    if (item == null) {
        nextArticleNumber = 1;
    }
    else {
        nextArticleNumber = item._id + 1;
    }

    console.log('Article create starting id at ' + nextArticleNumber);

    schema.plugin(autoIncrement.plugin, {
        model: 'Article',
        field: '_id',
        startAt: nextArticleNumber,
        incrementBy: 1
    });

});