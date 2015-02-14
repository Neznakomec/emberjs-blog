/**
 * Created by Ershov on 12.02.2015.
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
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
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


exports.User = mongoose.model('User', schema);
var User = exports.User;

// auto increment plugin
//
User.findOne().sort('-_id').exec(function(err, item) {
    var nextUserNumber = item._id + 1;
    console.log('user create starting id at ' + nextUserNumber);

    schema.plugin(autoIncrement.plugin, {
        model: 'User',
        field: '_id',
        startAt: nextUserNumber,
        incrementBy: 1
    });

});