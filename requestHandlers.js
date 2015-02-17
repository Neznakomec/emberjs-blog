/**
 * Created by Ershov on 01.02.2015.
 */
var querystring = require("querystring"),
    fs = require("fs"),
    md5 = require('MD5'),
    url = require("url");


var ARTICLES = [
    {
        id: 1,
        title: 'How to write a JavaScript Framework',
        author: 'Tomhuda Katzdale',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
        id: 2,
        title: 'Chronicles of an Embereño',
        author: 'Alerik Bryneer',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    },
    {
        id: 3,
        title: 'The Eyes of Thomas',
        author: 'Yehuda Katz',
        body: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    }
];

var Article = require('models/article').Article;

function articles(response, postData) {

    Article.find({}).find(function (err, results) {
        var stringedResult = JSON.stringify(results);
        console.log(stringedResult);
        response.write(JSON.stringify(results));
        response.end();
    });
}

function addArticle(response, postData) {
    var checkingToken = checkToken(response, postData);

    checkingToken.then(function (result) {
        if (result == true)
        {
            var article = querystring.parse(postData);
            delete article.token;
            delete article.account_id;
            article.author = {name: article["author[name]"]};
            delete article["author[name]"];

            var newArticle = new Article(article);
            newArticle.save(function (err, result) {
                var responseMessage = new Object();

                if (err) {
                    responseMessage["success"] = false;
                    responseMessage["message"] = err.message;
                }
                else
                {
                    responseMessage["success"] = true;
                    responseMessage["message"] = "Article successfully save at ID " + result._id;
                }

                response.write(JSON.stringify(responseMessage));
                response.end();
            });
        }
    });
}

var Comment = require('models/comment').Comment;

function comments(response, postData) {
    var comment = querystring.parse(postData);

    Comment.find({articleId: comment.articleId}).find(function (err, results) {
        var stringedResult = JSON.stringify(results);
        console.log(stringedResult);
        response.write(JSON.stringify(results));
        response.end();
    });
}

function addComment(response, postData) {
    var checkingToken = checkToken(response, postData);

    checkingToken.then(function (result) {
        if (result == true)
        {
            var comment = querystring.parse(postData);
            delete comment.token;
            delete comment.account_id;
            comment.author = {name: comment["author[name]"]};
            delete comment["author[name]"];

            var newComment = new Comment(comment);
            newComment.save(function (err, result) {
                var responseMessage = new Object();

                if (err) {
                    responseMessage["success"] = false;
                    responseMessage["message"] = err.message;
                }
                else
                {
                    responseMessage["success"] = true;
                    responseMessage["message"] = "Comment successfully save at ID " + result._id;
                }

                response.write(JSON.stringify(responseMessage));
                response.end();
            });
        }
    });
}

var User = require('models/user').User;

function getTokenForUsername(username) {
    return new Promise(function(resolve, reject) {
// здесь вытворяй что угодно, если хочешь асинхронно, потом…
        User.findOne({username: username}, '-_id hashedPassword', function(err, results)
        {
            if(err) {
                reject (err);
            } else {
                if (!results)
                    resolve(null);
                else resolve(results.hashedPassword);
            }
        });
    });
}

function getUserId(username)
{
    return new Promise(function(resolve, reject) {
// здесь вытворяй что угодно, если хочешь асинхронно, потом…
        User.findOne({username: username}, '_id', function(err, results)
        {
            if(err) {
                reject (err);
            } else {
                if (!results)
                    resolve(null);
                else resolve(results._id);
            }
        });
    });
}

function getUser(username) {
    return new Promise(function(resolve, reject) {
// здесь вытворяй что угодно, если хочешь асинхронно, потом…
        User.findOne({username: username}, '_id username hashedPassword', function(err, results)
        {
            if(err) {
                reject (err);
            } else {
                if (results != null)
                    resolve(results);
                else resolve(null);
            }
        });
    });
}

function getTokenForUserId(uid)
{
    return new Promise(function(resolve, reject) {
// здесь вытворяй что угодно, если хочешь асинхронно, потом…
        User.findOne({_id: uid}, 'hashedPassword', function(err, results)
        {
            if(err) {
                reject (err);
            } else {
                if (results != null)
                    resolve(results.hashedPassword);
                else (resolve(null));
            }
        });
    });
}

function checkToken(response, postData) {
    return new Promise(function (resolve, reject) {
        var request = response.request_field;

        var query, userToken, userId;
        if (request.method == 'GET') {
            var query = url.parse(request.url).query;
            var sessionIds = querystring.parse(query);
            userToken = sessionIds.token;
            userId = sessionIds.uid;
        }
        else if (request.method == 'POST') {
            var sessionIds = querystring.parse(postData);
            userToken = sessionIds.token;
            userId = sessionIds.account_id;
        }

        var gettingToken = getTokenForUserId(userId);
        gettingToken.then(function (resultToken) {
                if (!resultToken)
                {
                    response.statusCode = 401;
                    response.setHeader('Content-type', 'application/json');
                    response.write(JSON.stringify({error: 'Invalid user id. You provided: ' + userId}));
                    response.end();
                    resolve(false);
                }

                if (userToken && resultToken == userToken) {
                    resolve(true);
                }
                else {
                    response.statusCode = 401;
                    response.setHeader('Content-type', 'application/json');
                    response.write(JSON.stringify({error: 'Invalid token. You provided: ' + userToken}));
                    response.end();
                    resolve(false);
                }
            }
            , null);
    });
}

function session(response, postData) {
    // creating a session

    var POST = querystring.parse(postData);
    // use POST
    var username = POST["session[login_or_email]"],
        password = POST["session[password]"];

    // Generate and save the token (forgotten upon server restart).
    var userGetting = getUser(username);
    userGetting.then(function(result){
        var passwordToken = result.hashedPassword;
        var userId = result._id;

        if (passwordToken == undefined || userId == undefined)
        {
            var  POST_RESPONSE = {
                session: {
                    success: false,
                    message: 'Invalid username/password'
                }
            };

            response.end(JSON.stringify(POST_RESPONSE));
        }
        else
        {
            var POST_RESPONSE = {
                session: {
                    auth_token: passwordToken,
                    account_id: userId,
                    success: true
                }
            }

            console.log('for user ' + username + ' sent token '+passwordToken);
            response.end(JSON.stringify(POST_RESPONSE));
        }
    }, null);
}

function checkLogin(response, postData)
{
    var Login = querystring.parse(postData);
    var username = Login.username;

    if (username)
    {
        User.findOne({username: username}, 'hashedPassword', function(err, results){
            var POST_RESPONSE;

            if (err) throw err;

            if (results != null)
            {
                POST_RESPONSE = {
                    success: true,
                    message: "User exists"
                }
            } else {
                POST_RESPONSE = {
                    success: false,
                    message: "User login is free"
                }
            }

            response.statusCode = 200;
            response.setHeader('Content-type', 'application/json');
            response.write(JSON.stringify(POST_RESPONSE));
            response.end();
        });

    }
    else {
        response.statusCode = 401;
        response.setHeader('Content-type', 'application/json');
        response.write(JSON.stringify({error: 'Invalid login for checking. You provided: ' + username}));
        response.end();
    }
}


function register(response, postData)
{
    var POST = querystring.parse(postData);

    if (POST.loginOrEmail && POST.password)
    {
        var newUser = new User({username: POST.loginOrEmail, password: POST.password});


        User.findOne({username: POST.loginOrEmail}, 'hashedPassword', function(err, results){
            var POST_RESPONSE;

            if (err) throw err;

            if (results != null)
            {
                POST_RESPONSE = {
                    success: false,
                    message: "User exists"
                }
            } else {
                POST_RESPONSE = {
                    success: true,
                    message: "User " + POST.loginOrEmail + " successfully registered!"
                };

                newUser.save(function (err, product, numberAffected) {
                    if (err) throw err;
                    console.log('registered new user:');
                    console.log(product);
                });
            }

            response.statusCode = 200;
            response.setHeader('Content-type', 'application/json');
            response.write(JSON.stringify(POST_RESPONSE));
            response.end();
        });

    }
    else {
        response.statusCode = 401;
        response.setHeader('Content-type', 'application/json');
        response.write(JSON.stringify({error: 'Invalid login for checking. You provided: ' + username}));
        response.end();
    }
}




function returnFile(pathname, response, postData) {
    console.log("Request for a file " + pathname);
    if (pathname == '/') pathname = 'index.html';
    else pathname = __dirname + pathname;

    info = fs.readFile(pathname, function(err, info){ // callback function
        if (err){
            console.error(err);
            response.statusCode = 500;
            response.end("На сервере произошла ошибка");
            return;
        }
        response.end(info);
    });
}

exports.session = session;
exports.articles = articles;
exports.addArticle = addArticle;

exports.comments = comments;
exports.addComment = addComment;

exports.checkLogin = checkLogin;
exports.register = register;

exports.returnFile = returnFile;