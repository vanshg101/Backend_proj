import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    // Fetch total videos count
    const totalVideos = await Video.countDocuments({ owner: channelId });

    // Fetch total views from all videos
    const totalViews = await Video.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(channelId) } },
        { $group: { _id: null, totalViews: { $sum: "$views" } } }
    ]);

    // Fetch total subscribers
    const totalSubscribers = await Subscription.countDocuments({ subscribedTo: channelId });

    // Fetch total likes on all videos
    const totalLikes = await Like.countDocuments({ video: { $in: await Video.find({ owner: channelId }).select('_id') } });

    return res.status(200).json(
        new ApiResponse({
            totalVideos,
            totalViews: totalViews.length ? totalViews[0].totalViews : 0,
            totalSubscribers,
            totalLikes,
        })
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    const channelId = req.params.channelId;

    // Fetch videos uploaded by the channel owner
    const videos = await Video.find({ owner: channelId });

    return res.status(200).json(new ApiResponse(videos));
});


export {
    getChannelStats, 
    getChannelVideos
    }