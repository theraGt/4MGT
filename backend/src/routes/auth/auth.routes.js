import express from "express";
import {
  postLogin,
  postRegister,
  postVerifyUser,
  postVerifyLoginToken,
  putPassword,
  postForgotPassword,
  postResetPassword,
  getMe,
} from "../../controllers/auth/auth.controller.js";
import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.post("/login", postLogin);
router.post("/register", postRegister);
router.post("/verify", postVerifyUser);
router.post("/verify-login", postVerifyLoginToken);
router.get("/me", verifyToken, getMe);
router.put("/password", verifyToken, putPassword);
router.post("/forgot-password", postForgotPassword);
router.post("/reset-password", postResetPassword);

export default router;