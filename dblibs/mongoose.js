/**
 * Created by Ershov on 12.02.2015.
 */

var mongoose = require('mongoose');
var config = require('./config');

mongoose.connect(config.getConnectAddress());

module.exports = mongoose;