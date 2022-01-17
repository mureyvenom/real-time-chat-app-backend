import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { RequestHandler } from "express";

export const signup: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log("errors array", errors);
      const error = new Error("Validation failed, incorrect data entered.");

      //   error.statusCode = 422;
      error.message = errors.array({ onlyFirstError: true }).toString();
      throw error;
    }
    const { email, name, password, phone } = req.body;
    console.log("body object", req.body);
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email: email,
      name: name,
      password: hashedPassword,
      phone: phone,
    });
    const createUser = await user.save();
    res.status(201).json({
      message: "User created",
      userId: createUser._id,
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const userExists = await User.findOne({ email: email });
    if (!userExists) {
      const error = new Error("Incorrect login credentials");
      // error.statusCode = 401;
      throw error;
    }

    const comparePassword = await bcrypt.compare(password, userExists.password);
    if (!comparePassword) {
      const error = new Error("Incorrect login credentials");
      // error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        email: userExists.email,
        userId: userExists._id.toString(),
      },
      "real_time_chat_app_secret_token"
    );

    res.status(200).json({
      token: token,
      userDetails: {
        _id: userExists._id.toString(),
        name: userExists.name,
        profileImage: userExists.profileImage,
        status: userExists.status,
      },
    });
  } catch (err: any) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
