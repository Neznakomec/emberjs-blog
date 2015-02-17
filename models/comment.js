/**
 * Created by Ershov on 16.02.2015.
 */
var mongoose = require('dblibs/mongoose');
var autoIncrement = require('mongoose-auto-increment');
autoIncrement.initialize(mongoose);

var Schema = mongoose.Schema;

var schema = new Schema({
    _id: {
        type: Number,
        unique: true
    },
    articleId: {
        type: Number,
        required: true
    },
    author: {
        name: {
            type: String,
            required: true
        }
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

exports.Comment = mongoose.model('Comment', schema);
var Comment = exports.Comment;

// auto increment plugin
//
Comment.findOne().sort('-_id').exec(function(err, item) {
    var nextCommentNumber;
    if (item == null) {
        nextCommentNumber = 1;
    }
    else {
        nextCommentNumber = item._id + 1;
    }

    console.log('Comment create starting id at ' + nextCommentNumber);

    schema.plugin(autoIncrement.plugin, {
        model: 'Comment',
        field: '_id',
        startAt: nextCommentNumber,
        incrementBy: 1
    });

});