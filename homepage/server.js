const finalhandler = require("finalhandler");
const http = require("http");
const serveStatic = require("serve-static");
const path = require("path");
const morgan = require("morgan");

const PUBLIC = path.join(__dirname, "build");
// Serve up public/ftp folder
const serve = serveStatic(PUBLIC, { index: ["index.html"] });
const logger = morgan("dev");

// Create server
const server = http.createServer(function onRequest(req, res) {
  logger(req, res, () => {});
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'none'; " +
      "connect-src https://www.google-analytics.com https://sentry.prod.mozaws.net; " +
      "style-src 'self' https://fonts.googleapis.com; " +
      "font-src 'self' https://fonts.googleapis.com; " +
      "script-src 'self' https://www.google-analytics.com; " +
      "img-src 'self' data:; " +
      "child-src https://www.youtube.com"
  );
  serve(req, res, finalhandler(req, res));
});

// Listen
server.listen(3000);
console.log("Serving on http://localhost:3000");
