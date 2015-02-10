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

function start(response, postData) {
    console.log("Request handler 'start' was called.");

    var body = '<html>'+
        '<head>'+
        '<meta http-equiv="Content-Type" '+
        'content="text/html; charset=UTF-8" />'+
        '</head>'+
        '<body>'+
        '<form action="/upload" enctype="multipart/form-data" '+
        'method="post">'+
        '<input type="file" name="upload"><br>'+
        '<input type="submit" value="Upload file" />'+
        '</form>'+
        '</body>'+
        '</html>';

    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
}

function articles(response, postData) {

    if (checkToken(response, postData))
    {
    response.write(JSON.stringify(ARTICLES));
    response.end();
    }
}

function upload(response, postData) {
    console.log("Request handler 'upload' was called.");
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("You've sent the text: "+
    querystring.parse(postData).text );
    response.end();
}

function show(response, postData) {
    console.log("Request handler 'show' was called.");
    fs.readFile("./test.png", "binary", function(error, file)
    {
        if(error)
        {
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error + "\n");
            response.end();
        }
        else
        {
            response.writeHead(200, {"Content-Type": "image/png"});
            response.write(file, "binary");
            response.end();
        }
    });
}

function getTokenForUsername(username) {
    if (username=='ember')
    {
        return md5('casts');
    }
    else return null;
}

function getUserId(username)
{
    if (username=='ember')
    {
        return 1;
    }
}

function getTokenForUserId(uid)
{
    if (uid == 1)
    return getTokenForUsername('ember');
}

function checkToken(response, postData)
{
    var request = response.request_field;

    var query = url.parse(request.url).query;
    var sessionIds = querystring.parse(query);
    var userToken = sessionIds.token;
    var userId = sessionIds.uid;

    if (getTokenForUserId(userId) == userToken)
    {
        return true;
    }
    else
    {
        response.statusCode = 401;
        response.setHeader('Content-type', 'application/json');
        response.write(JSON.stringify({ error: 'Invalid token. You provided: ' + userToken }));
        response.end();
        return false;
    }
}


function session(response, postData) {
    // creating a session

    var POST = querystring.parse(postData);
    // use POST
    var username = POST["session[login_or_email]"],
        password = POST["session[password]"];

    if (username == 'ember' && password == 'casts') {
        // Generate and save the token (forgotten upon server restart).
        var passwordToken = getTokenForUsername(username);
        var userId = getUserId(username);

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
    else {
        var  POST_RESPONSE = {
            session: {
            success: false,
            message: 'Invalid username/password'
            }
        };

        response.end(JSON.stringify(POST_RESPONSE));
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
exports.start = start;
exports.upload = upload;
exports.show = show;

exports.session = session;
exports.articles = articles;

exports.returnFile = returnFile;