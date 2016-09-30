var http = require('http');

// var server = http.createServer(function(req, res) {
  // // res.writeHead(200);
  // res.end('Hello Http');
  // res.statusCode = 200;
  // res.setHeader('Content-Type', 'text/plain');
  // res.end('Hello World\n');
// });
// server.listen(8080);
// var http = require('http'),
    fs = require('fs');


fs.readFile('./test_2.html', function (err, html) {
    if (err) {
        throw err; 
    }       
   
    http.createServer(function(request, response) {  
        response.writeHeader(200, {"Content-Type": "text/html"});  
        response.write(html);  
        response.end();  
    }).listen(8080);
    console.log('test');
});