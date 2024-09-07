import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const userId = req.user.id; // Assuming you have user authentication in place

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, 'Tweet content cannot be empty');
    }

    const tweet = new Tweet({
        content,
        owner: userId
    });

    await tweet.save();

    return res.status(201).json(new ApiResponse({ message: 'Tweet created successfully', tweet }));
});


const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'Invalid user ID');
    }

    const tweets = await Tweet.find({ owner: userId }).sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(tweets));
});


const updateTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const { content } = req.body;
    const userId = req.user.id; // Assuming you have user authentication

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    if (!content || content.trim().length === 0) {
        throw new ApiError(400, 'Tweet content cannot be empty');
    }

    const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });

    if (!tweet) {
        throw new ApiError(404, 'Tweet not found or you do not have permission to update it');
    }

    tweet.content = content;
    await tweet.save();

    return res.status(200).json(new ApiResponse({ message: 'Tweet updated successfully', tweet }));
});


const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user.id; // Assuming you have user authentication

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'Invalid tweet ID');
    }

    const tweet = await Tweet.findOne({ _id: tweetId, owner: userId });

    if (!tweet) {
        throw new ApiError(404, 'Tweet not found or you do not have permission to delete it');
    }

    await tweet.remove();

    return res.status(200).json(new ApiResponse({ message: 'Tweet deleted successfully' }));
});


export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}