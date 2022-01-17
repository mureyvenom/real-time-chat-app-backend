"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const crypto_1 = __importDefault(require("crypto"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
//mongo connection url
const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.n4owb.mongodb.net/${process.env.MONGO_DEFAULT_DB}?retryWrites=true&w=majority`;
//configs
const fileStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "images");
    },
    filename: (req, file, cb) => {
        const fileExt = file.originalname.substring(file.originalname.lastIndexOf(".") + 1, file.originalname.length);
        cb(null, `${crypto_1.default
            .createHash("md5")
            .update(Math.floor(Math.random() * 100000).toString())
            .digest("hex")}.${fileExt}`);
    },
});
//file filter function
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "image/png" ||
        file.mimetype === "image/jpeg" ||
        file.mimetype === "image/jpg") {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
};
//import routes
const user_1 = __importDefault(require("./routes/user"));
//middlewares
app.use(body_parser_1.default.json());
app.use("/images", express_1.default.static(path_1.default.join(__dirname, "images")));
const accessLogStream = fs_1.default.createWriteStream(path_1.default.join(__dirname, "access_log"), {
    flags: "a",
});
app.use((0, multer_1.default)({
    storage: fileStorage,
    fileFilter: fileFilter,
}).single("image"));
// app.use(compression());
// app.use(morgan('combined', {
//     stream: accessLogStream
// }));
//cors headers
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});
// app.use(helmet());
//use routes
app.use("/user", user_1.default);
//error handling routes
app.use((error, req, res, next) => {
    console.log(error);
    const { message } = error;
    res.status(500).json({
        message: message,
        // data: data,
    });
});
//connect to db and listen
mongoose_1.default
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
