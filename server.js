const express = require("express");
const path = require("path");
const routes = require("./routes");
const fileUpload = require("express-fileupload");

var app = express(),http = require("http"),server = http.createServer(app);

// Config
const PORT = process.env.PORT,addrIP = process.env.IP;

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());

app.set("port",process.env.PORT || 3000);

app.set("views",path.join(__dirname,"views"));
app.set("view engine","ejs");

app.use(fileUpload());
app.use(routes);

// launch the http server on given port
server.listen(PORT || 3000, addrIP || "127.1.1.1", () => {
	const addr = server.address();
	console.log("Web server listening at", addr.address + ":" + addr.port);
});