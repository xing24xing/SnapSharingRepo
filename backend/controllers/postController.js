import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import { Post } from "../models/postModel.js";
import { User } from "../models/userModels.js";
import {Comment} from "../models/commentModel.js"
export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const userId = req.id;
    if (!image) {
      return res.status(400).json({
        message: "Image required",
        success: false,
      });
    }
    // upload
    const optimizeImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, height: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();
    const fileuri = `data:image/jpeg;base64,${optimizeImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader.upload(fileuri);
    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: userId,
    });
    const user = await User.findById(userId);
    if (user) {
      user.posts.push(post._id);
      await user.save();
    }
    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      message: "New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: 'author', select: 'username profilePicture'})
      .populate({path:'comments',sort:{createdAt:-1},populate:{
        path:'author',
        select:'username profilePicture'
      }});
      return res.status(200).json({
        posts,
        success:true
      })
  } catch (error) {
    console.log(error);
  }
};

export const getUserPost = async(req,res)=>{
    try {
        const userId = req.id;
        const posts = await Post.find({author:userId}).sort({createdAt:-1}).populate({
            path:'author',
            select:'username ,profilePicture'
        }).populate({
            path:'comments',
            sort:{createdAt:-1},
            populate:{
                path:'author',
                select:'username, profilePicture'
            }
        })
        return res.status(200).json({
            posts,
            success:true
          }) 
        
    } catch (error) {
     console.log(error);
        
    }
}

export const likes = async(req,res)=>{
    try {
        const likeUserID = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if(!post){
            return res.status(400).json({
                message:"post not found",
                success:false
                
            })
        }
        await post.updateOne({$addToSet:{
            likes:likeUserID
        }})
        await post.save();
        const user = await User.findById(likeUserID).select('username profilePicture');
        const postOwnerId = post.author.toString();
        if(postOwnerId !== likeUserID){
          const notification = {
            type:'like',
            userId:likeUserID,
            userDetails:user,
            postId,
            message:'Your Post was liked'

          }
          const postOwnerSocketId = getReceivedSocketId(postOwnerId);
          io.to(postOwnerSocketId).emit('notification',notification);
        }
        return res.status(200).json({message:'Post liked', success:true});
    } catch (error) {
        console.log(error);
        
    }
}

export const postDisliked =  async(req,res)=>{
  try {
    const likeUserID = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if(!post){
        return res.status(400).json({
            message:"post not found",
            success:false
            
        })
    }
    await post.updateOne({$addToSet:{
        likes:likeUserID
    }})
    await post.save();
    const user = await User.findById(likeUserID).select('username profilePicture');
    const postOwnerId = post.author.toString();
    if(postOwnerId !== likeUserID){
      const notification = {
        type:'dislike',
        userId:likeUserID,
        userDetails:user,
        postId,
        message:'Your Post was liked'

      }
      // const postOwnerSocketId = getReceivedSocketId(postOwnerId);
      // io.to(postOwnerSocketId).emit('notification',notification);
    }
    return res.status(200).json({message:'Post disliked', success:true});
} catch (error) {
    console.log(error);
    
}
}

export const addComment = async(req,res)=>{
  try {
      const postId = req.params.id;
      const CommentuserId = req.id;
      const {text} = req.body;
      const post = await Post.findById(postId);
      if(!text){
        return res.status(400).josn({
          messgae:"text is required",
          success:false
        })
      }
      const comment = await Comment.create({
        text,
        author:CommentuserId,
        post:postId
      })

      await comment.populate({
          path:'author',
          select:'username profilePicture'
      })
      post.comments.push(comment._id);
      await post.save();
      return res.status(201).json({
        message:"comment added",
        comment,
        success:true
      })
  } catch (error) {
    console.log(error)
  }

}

export const getPostComments = async(req,res)=>{
   try {
    const postId = req.params.Id;
    const comments = await Comment.find({post:postId}).populate('author','username profilePicture');
    if(!comments){
      return res.status(404).json({
        message:"No comments found in this post",
        success:false
        
      })
    }
    return res.status(200).json({
      success:true,
      comments
    })
    
   } catch (error) {
    console.log(error);
    
   }
}
export const deletePost = async(req,res)=>{
  try {
    const postId = req.params.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message:"Post not Found",
        success:false
      })
    }
    if(post.author.toString() != authorId){
      return res.status(403).json({
        messgae:'Unauthorized User'
      })
    }
    await Post.findByIdAndDelete(postId);
    let user = await User.findById(authorId);
    user.posts = user.posts.filter(id => id.toString()!=postId);
    await user.save();
    await Comment.deleteMany({Post:postId});
    return res.status(200).json({
      message:"Post deleted successfully.",
      success:true
    })

  } catch (error) {
    console.log(error);
    
  }
}

export const bookmarks = async(req,res)=>{
  try {
    
    const postId = req.param.id;
    const authorId = req.id;
    const post = await Post.findById(postId);
    if(!post){
      return res.status(404).json({
        message:"Post not found",
        success:false
      })
    } 
    const user = await User.findById(authorId);
    if(user.bookmarks.includes(post._id)){
      await user.updateOne({$pull:{bookmarks:post._id}});
      await user.save();
      return res.status(200).json({
        type:'unsaved',
        message:"Post removed from bookmarks",
        success:true
      })
    }else{
      await user.updateOne({$addToSet:{bookmarks:post._id}});
      await user.save();
      return res.status(200).json({
        type:'saved',
        message:"Post added to bookmarks",
        success:true
      })
    }
  } catch (error) {
    console.log(error);
  }
}