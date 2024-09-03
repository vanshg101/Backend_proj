import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        return res.status(400).json(new ApiError(400, "Invalid video ID"));
    }

    const comments = await Comment.find({ video: videoId })
        .populate('owner', 'fullName email') 
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }); 
    const totalComments = await Comment.countDocuments({ video: videoId });

    return res.status(200).json(new ApiResponse(200, {
        comments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        totalComments
    }, "Comments fetched successfully"));
});


const addComment = asyncHandler(async (req, res) => {
   const {userId,videoId,content}=req.body;
   if (!content||content.trim()==="") {
        throw new ApiError(400,"Add comment first");
   }
   const owner= await owner.findById(userId);
   if (!owner) {
    throw new ApiError(404,"owner not found");
   }
   const comment = await Comment.create({
    owner:userId,
    video:videoId,
    comment:content.trim()
   })
   return res
   .status(201)
   .json(new ApiResponse(201,comment,"comment added Succesfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params; 
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Comment content is required");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to update this comment");
    }

    comment.content = content.trim();
    await comment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
});


const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(400, "Invalid comment ID");
    }

    const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.owner._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this comment");
    }

    await comment.deleteOne();

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }