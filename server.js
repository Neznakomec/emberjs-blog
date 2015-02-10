/**
 * Created by Ershov on 01.02.2015.
 */
var http = require("http");
var url = require("url");

function start(route, handle) {
    function onRequest(request, response) {
        var postData = "";
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");

        request.setEncoding("utf8");

        request.addListener("data", function(postDataChunk) {
            postData += postDataChunk;
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (postData.length > 1e6) {
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
            }
            /*
            postData += postDataChunk;
            console.log("Received POST data chunk '"+
            postDataChunk + "'.");
            */
        });

        request.addListener("end", function() {
            response.request_field = request;
            route(handle, pathname, response, postData);
        });

    }

    http.createServer(onRequest).listen(3000);
    console.log("Server has started.");
}

exports.start = start;