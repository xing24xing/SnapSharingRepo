import { User } from "../models/userModels.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDatauri from "../utils/datauri.js"; // Correcting the import
import cloudinary from "../utils/cloudinary.js"; // Correcting the import
import { Post } from "../models/postModel.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fildes are required.",
        success: false,
      });
    }
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "This user id already exist! try different",
        success: false,
      });
    }
    const hashedPass = await bcrypt.hash(password, 10);
    await User.create({
      username,
      email,
      password: hashedPass,
    });
    return res.status(201).json({
      message: "You're account created successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "All fildes are required.",
        success: false,
      });
    }
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Incorrect email and password.",
        success: false,
      });
    }
    const isPassMatch = await bcrypt.compare(password, user.password);
    if (!isPassMatch) {
      return res.status(400).json({
        message: "Incorrect email and password.",
        success: false,
      });
    }
    const token = await jwt.sign({ userId: user._id }, process.env.TOKEN, {
      expiresIn: "1d",
    });
    const populatedPost = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      bio: user.bio,
      followers: user.followers,
      following: user.following,
      posts: populatedPost,
    };
    return res
      .cookie("token", token, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1 * 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user,
      });
  } catch (error) {
    console.log(error);
  }
};

export const logout = async (req, res) => {
  try {
    return res.cookie("token", "", { maxAge: 0 }).json({
      message: "Logged out successfully",
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    let user = await User.findById(userId).select("-password");
    return res.status(200).json({
      user,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;
    if (profilePicture) {
      const fileuri = getDatauri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileuri);
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();
    return res.status(200).json({
      message: "Profile updated successfully",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getOtherUser = async (req, res) => {
  try {
    const suggestedUser = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );
    if (!suggestedUser) {
      return res.status(400).json({
        message: "Currently do not have any users",
        success: false,
      });
    }
    return res.status(200).json({
      success: true,
      users: suggestedUser,
    });
  } catch (error) {
    console.log(error);
  }
};

export const followOrUnfollow = async (req, res) => {
  try {
    const followerId = req.id; // The logged-in user's ID
    const followingId = req.params.id; // The ID of the user to follow/unfollow

    // Prevent self-following
    if (followerId === followingId) {
      return res.status(400).json({
        message: "You cannot follow yourself",
        success: false,
      });
    }

    // Find both users
    const user = await User.findById(followerId);
    const targetUser = await User.findById(followingId);

    // Check if both users exist
    if (!user || !targetUser) {
      return res.status(400).json({
        message: "User not found",
        success: false,
      });
    }

    // Check if the user is already following the target user
    const isFollowing = user.following.includes(followingId);

    if (isFollowing) {
      // Unfollow
      await Promise.all([
        User.updateOne(
          { _id: followerId },
          { $pull: { following: followingId } }
        ),
        User.updateOne(
          { _id: followingId },
          { $pull: { followers: followerId } }
        ), // Correct field
      ]);
      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
      });
    } else {
      // Follow
      await Promise.all([
        User.updateOne(
          { _id: followerId },
          { $push: { following: followingId } }
        ),
        User.updateOne(
          { _id: followingId },
          { $push: { followers: followerId } }
        ), // Correct field
      ]);
      return res.status(200).json({
        message: "Followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred",
      success: false,
      error: error.message,
    });
  }
};
