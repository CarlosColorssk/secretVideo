const cors = require("cors");
const express = require("express");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({storage})
const app = express();


const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200
}

app.use(cors(corsOptions));
const initRoutes = require("./routes");
app.use(express.urlencoded({extended: true}));
app.use(upload.any());
initRoutes(app);

let port = 8080;
app.listen(port, () => {
  console.log(`Server running at localhost: ${port}`);
})