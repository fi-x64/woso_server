const dotenv = require("dotenv");
const { Sequelize, DataTypes } = require("sequelize");
const https = require("https");
const fs = require("fs");

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: ".env" });
const app = require("./app");

// const options = {
//   // key: fs.readFileSync("/home/ubuntu/code/deploy/key.pem"),
//   // cert: fs.readFileSync("/home/ubuntu/code/deploy/cert.pem"),
//   key: fs.readFileSync("/etc/letsencrypt/live/thetruenest.com/privkey.pem"),
//   cert: fs.readFileSync("/etc/letsencrypt/live/thetruenest.com/fullchain.pem"),
// };

const port = process.env.PORT || 3001;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// const server = https.createServer(options, app).listen(port, () => {
//   console.log(`Server is running on https://localhost:${port}`);
// });

process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
