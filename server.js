const http = require("http");
const app = require('./app');

const serverPort = process.env.PORT;
const server = http.createServer(app);
server.listen(serverPort);