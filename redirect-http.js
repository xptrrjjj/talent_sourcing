// redirect-http.js
const http = require('http');

const host = 'localhost';
const port = 80;

http.createServer((req, res) => {
  res.writeHead(301, { Location: `https://${host}:443${req.url}` });
  res.end();
}).listen(port, () => {
  console.log(`HTTP server running at http://${host}:${port}`);
});
