 import { asyncHandler } from "../utils/asyncHandler.js";
 import {APIError} from "../utils/ApiError.js"
 import {User} from "../modles/user.model.js"
 import { ApiResponse } from "../utils/ApiResponse.js";
 import {uplodeOnCloudinary} from "../utils/cloudinary.js"
 import jwt from "jsonwebtoken"
import mongoose from "mongoose";

 const registerUser = asyncHandler( async(req,res) =>{
    const {fullName,email,username,password}=req.body

    if (fullName =="") {
        throw new APIError(400,"fullname is required")
    }
    if (
        [fullName,email,username,password].some((field)=>
        field?.trim ==="")
    ) {
        throw new APIError(400,"All field are required")
    }
    const existedUser= await User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new APIError(409,"User with email or username already exist")
    }
    console.log("req.files:", req.files);
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) 
        &&req.files.coverImage.length >0) {
        coverImageLocalPath=req.files?.coverImage[0]?.path;
    }


    if (!avatarLocalPath) {
        throw new APIError(400,"Avatar file is required")
    }

    const avatar =await uplodeOnCloudinary(avatarLocalPath)
    const coverImage = await uplodeOnCloudinary(coverImageLocalPath)
  
    if(!avatar){
        throw new APIError(400,"Avatar file is required")
    }

    const user =await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url||"",
        email,
        password,
        username:username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new APIError(500,"something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered successfully")
    );

 } )
 export {registerUser}