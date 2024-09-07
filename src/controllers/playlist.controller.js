import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id; // Assuming you have user authentication middleware in place

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

    if (existingLike) {
        // Unlike the video
        await existingLike.remove();
        return res.status(200).json(new ApiResponse({ message: 'Video unliked' }));
    } else {
        // Like the video
        const like = new Like({ video: videoId, likedBy: userId });
        await like.save();
        return res.status(201).json(new ApiResponse({ message: 'Video liked' }));
    }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id; // Assuming user authentication middleware is in place

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'Invalid comment ID');
    }

    const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingLike) {
        // Unlike the comment
        await existingLike.remove();
        return res.status(200).json(new ApiResponse({ message: 'Comment unliked' }));
    } else {
        // Like the comment
        const like = new Like({ comment: commentId, likedBy: userId });
        await like.save();
        return res.status(201).json(new ApiResponse({ message: 'Comment liked' }));
    }
});


const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user.id; // Assuming user authentication middleware is in place

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    const existingLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingLike) {
        // Unlike the tweet
        await existingLike.remove();
        return res.status(200).json(new ApiResponse({ message: 'Tweet unliked' }));
    } else {
        // Like the tweet
        const like = new Like({ tweet: tweetId, likedBy: userId });
        await like.save();
        return res.status(201).json(new ApiResponse({ message: 'Tweet liked' }));
    }
});


const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const likedVideos = await Like.find({ likedBy: userId, video: { $exists: true } })
        .populate('video')
        .select('video -_id'); // Omit the _id of the like and only return the video details

    return res.status(200).json(new ApiResponse(likedVideos.map(like => like.video)));
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}