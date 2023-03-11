var express = require('express');
var router = express.Router();
const uploadController = require("../controllers/fileUploadController")

let routes = app => {
  router.post("/upload", uploadController.uploadFiles)
  app.get("/", (req, res)=>{
    res.send("Express run successfully");
  })
  return app.use("/", router);
}

module.exports = routes;