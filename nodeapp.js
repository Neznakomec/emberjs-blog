/**
 * Created by Ershov on 23.01.2015.
 */

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
// User auth
handle["/session"] = requestHandlers.session;
// User creation
handle["/checkLogin"] = requestHandlers.checkLogin;
handle["/register"] = requestHandlers.register;
// Article view/create
handle["/articles.json"] = requestHandlers.articles;
handle["/addArticle"] = requestHandlers.addArticle;
// Comment view/create
handle["/comments.json"] = requestHandlers.comments;
handle["/addComment"] = requestHandlers.addComment;


handle["defaultFileHandler"] = requestHandlers.returnFile;

server.start(router.route, handle);