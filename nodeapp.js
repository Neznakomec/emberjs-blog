/**
 * Created by Ershov on 23.01.2015.
 */

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {};
// handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/upload"] = requestHandlers.upload;
handle["/show"] = requestHandlers.show;

handle["/session"] = requestHandlers.session;
handle["/articles"] = requestHandlers.articles;
handle["defaultFileHandler"] = requestHandlers.returnFile;

handle["/articles.json"] = requestHandlers.articles;
handle["/test"] = requestHandlers.test;
server.start(router.route, handle);
/*
var http = require('http');
var fs = require('fs');
var qs = require('querystring');

http.createServer(function (req, res) {
    var info;

    if (req.url == '/session') {
        if (req.method == 'POST')
        {
            var body = '';

            req.on('data', function (data) {
                body += data;
                // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
                if (body.length > 1e6) {
                    // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                    request.connection.destroy();
                }
            });

            req.on('end', function () {

                var POST = qs.parse(body);
                // use POST
                var POST_RES = {
                    session: {
                        auth_token: '1',
                        account_id: POST["session[login_or_email]"]
                    }
                }

                res.end(JSON.stringify(POST_RES));

            });
        }

    } else {
        if (req.url == '/') req.url = 'index.html';
        else req.url = '.' + req.url;

        info = fs.readFile(req.url, function(err, info){ // callback function
            if (err){
                console.error(err);
                res.statusCode = 500;
                res.end("На сервере произошла ошибка");
                return;
            }
            res.end(info);
        });
    }
}).listen(3000);
    */