"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_1 = require("../controllers/user");
const express_validator_1 = require("express-validator");
const user_2 = __importDefault(require("../models/user"));
const router = (0, express_1.Router)();
router.post("/signup", [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value, { req }) => {
        return user_2.default.findOne({ email: value }).then((userDoc) => {
            if (userDoc) {
                return Promise.reject("Email address already exists");
            }
        });
    })
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .trim()
        .isLength({ min: 5 })
        .withMessage("Password must be at least 5 characters long"),
    (0, express_validator_1.body)("name").trim().not().isEmpty(),
], user_1.signup);
router.post("/login", user_1.login);
exports.default = router;
