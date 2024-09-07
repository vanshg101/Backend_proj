import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    const userId = req.user.id; // Assuming you have user authentication middleware

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid channel ID');
    }

    // Check if the user is trying to subscribe to themselves
    if (channelId === userId) {
        throw new ApiError(400, 'You cannot subscribe to yourself');
    }

    const existingSubscription = await Subscription.findOne({ subscriber: userId, channel: channelId });

    if (existingSubscription) {
        // Unsubscribe from the channel
        await existingSubscription.remove();
        return res.status(200).json(new ApiResponse({ message: 'Unsubscribed from the channel' }));
    } else {
        // Subscribe to the channel
        const subscription = new Subscription({ subscriber: userId, channel: channelId });
        await subscription.save();
        return res.status(201).json(new ApiResponse({ message: 'Subscribed to the channel' }));
    }
});


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, 'Invalid channel ID');
    }

    const subscribers = await Subscription.find({ channel: channelId })
        .populate('subscriber', 'name email') // Populating subscriber details (e.g., name, email)
        .select('subscriber -_id'); // Return only the subscriber details

    return res.status(200).json(new ApiResponse(subscribers.map(sub => sub.subscriber)));
});


// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, 'Invalid subscriber ID');
    }

    const subscriptions = await Subscription.find({ subscriber: subscriberId })
        .populate('channel', 'name') // Populating channel details (e.g., name)
        .select('channel -_id'); // Return only the channel details

    return res.status(200).json(new ApiResponse(subscriptions.map(sub => sub.channel)));
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}