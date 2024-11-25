import express from "express";
import isAuth from "../middleware/isAuth.js";
import upload from "../middleware/mlter.js";
import { addComment, addNewPost, bookmarks, deletePost, getAllPost,  getPostComments,  getUserPost,  likes, postDisliked } from "../controllers/postController.js";

const router = express.Router();
router.route("/addPost").post(isAuth,upload.single('image'),addNewPost);
router.route("/all").get(isAuth,getAllPost);
router.route("/userpost/all").get(isAuth,getUserPost)
router.route("/:id/like").get(isAuth,likes)
router.route("/:id/dislike").get(isAuth,postDisliked);
router.route("/:id/comment").post(isAuth,addComment);
router.route("/:id/comment/all").post(isAuth,getPostComments);
router.route("/delete/:id").delete(isAuth,deletePost);
router.route("/:id/bookmark").get(isAuth,bookmarks);

export default router;