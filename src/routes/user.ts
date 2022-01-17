import { Router } from "express";
import { signup, login } from "../controllers/user";
import { body } from "express-validator";
import User from "../models/user";
const router = Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email address already exists");
          }
        });
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 characters long"),
    body("name").trim().not().isEmpty(),
  ],
  signup
);

router.post("/login", login);

export default router;
