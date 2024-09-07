import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = 'desc', userId } = req.query;

    const filter = query
        ? { title: { $regex: query, $options: 'i' }, ...(userId && { owner: userId }) }
        : userId
        ? { owner: userId }
        : {};

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortType === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit, 10));

    const totalVideos = await Video.countDocuments(filter);

    return res.status(200).json(new ApiResponse({ videos, totalVideos, page, limit }));
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id;
    const videoFile = req.file;

    if (!videoFile) {
        throw new ApiError(400, 'No video file provided');
    }

    const cloudinaryResult = await uploadOnCloudinary(videoFile.path);

    const video = new Video({
        title,
        description,
        videoFile: cloudinaryResult.secure_url,
        owner: userId,
        thumbnail: cloudinaryResult.secure_url,
    });

    await video.save();

    return res.status(201).json(new ApiResponse({ message: 'Video published successfully', video }));
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(404, 'Video not found');
    }

    return res.status(200).json(new ApiResponse(video));
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description, thumbnail } = req.body;
    const userId = req.user.id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findOne({ _id: videoId, owner: userId });

    if (!video) {
        throw new ApiError(404, 'Video not found or you do not have permission to update it');
    }

    video.title = title || video.title;
    video.description = description || video.description;
    video.thumbnail = thumbnail || video.thumbnail;

    await video.save();

    return res.status(200).json(new ApiResponse({ message: 'Video updated successfully', video }));
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findOne({ _id: videoId, owner: userId });

    if (!video) {
        throw new ApiError(404, 'Video not found or you do not have permission to delete it');
    }

    await video.remove();

    return res.status(200).json(new ApiResponse({ message: 'Video deleted successfully' }));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'Invalid video ID');
    }

    const video = await Video.findOne({ _id: videoId, owner: userId });

    if (!video) {
        throw new ApiError(404, 'Video not found or you do not have permission to update it');
    }

    video.isPublished = !video.isPublished;
    await video.save();

    return res.status(200).json(new ApiResponse({ message: `Video ${video.isPublished ? 'published' : 'unpublished'}`, video }));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
