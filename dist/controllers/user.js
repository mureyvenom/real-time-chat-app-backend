"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const express_validator_1 = require("express-validator");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log("errors array", errors);
            const error = new Error("Validation failed, incorrect data entered.");
            //   error.statusCode = 422;
            error.message = errors.array({ onlyFirstError: true }).toString();
            throw error;
        }
        const { email, name, password, phone } = req.body;
        console.log("body object", req.body);
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const user = new user_1.default({
            email: email,
            name: name,
            password: hashedPassword,
            phone: phone,
        });
        const createUser = yield user.save();
        res.status(201).json({
            message: "User created",
            userId: createUser._id,
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const userExists = yield user_1.default.findOne({ email: email });
        if (!userExists) {
            const error = new Error("Incorrect login credentials");
            // error.statusCode = 401;
            throw error;
        }
        const comparePassword = yield bcryptjs_1.default.compare(password, userExists.password);
        if (!comparePassword) {
            const error = new Error("Incorrect login credentials");
            // error.statusCode = 401;
            throw error;
        }
        const token = jsonwebtoken_1.default.sign({
            email: userExists.email,
            userId: userExists._id.toString(),
        }, "real_time_chat_app_secret_token");
        res.status(200).json({
            token: token,
            userDetails: {
                _id: userExists._id.toString(),
                name: userExists.name,
                profileImage: userExists.profileImage,
                status: userExists.status,
            },
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
});
exports.login = login;
