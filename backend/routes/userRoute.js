import express from "express";
import { editProfile, followOrUnfollow, getOtherUser, getProfile, login, logout, register } from "../controllers/userController.js";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/mlter.js";

const router = express.Router();
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/:id/profile').get(isAuth,getProfile);
router.route('/other').get(isAuth,getOtherUser);
router.route('/profile/edit').post(isAuth,upload.single('profilePhoto'),editProfile);
router.route('/followorunfollow/:id').post(isAuth,followOrUnfollow);

export default router;
