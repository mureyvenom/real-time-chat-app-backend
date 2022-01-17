import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import helmet from "helmet";
// import compression from 'compression';
import morgan from "morgan";
import bodyParser from "body-parser";

const app = express();

//mongo connection url
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.n4owb.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`;

//configs
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const fileExt = file.originalname.substring(
      file.originalname.lastIndexOf(".") + 1,
      file.originalname.length
    );
    cb(
      null,
      `${crypto
        .createHash("md5")
        .update(Math.floor(Math.random() * 100000).toString())
        .digest("hex")}.${fileExt}`
    );
  },
});

//file filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

//import routes
import userRoutes from "./routes/user";

//middlewares
app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access_log"),
  {
    flags: "a",
  }
);
app.use(
  multer({
    storage: fileStorage,
    fileFilter: fileFilter,
  }).single("image")
);
// app.use(compression());
// app.use(morgan('combined', {
//     stream: accessLogStream
// }));

//cors headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
// app.use(helmet());

//use routes
app.use("/user", userRoutes);

//error handling routes
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.log(error);
  const { message } = error;
  res.status(500).json({
    message: message,
    // data: data,
  });
});

//connect to db and listen
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    console.log("Mongoose connected");
    app.listen(3001);
    // const server = https.createServer({
    //     key: privateKey,
    //     cert: certificate
    // }, app)
    // .listen(process.env.PORT || 5100);
    // const server = app.listen(process.env.PORT || 5100);
    // const io = require('./socket').init(server);
    // io.on('connection', socket => {
    //     console.log('Client connected');
    // })
  })
  .catch((err) => console.log(err));
