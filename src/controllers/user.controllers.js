 import { asyncHandler } from "../utils/asyncHandler.js";
 import {APIError} from "../utils/ApiError.js"
 import {User} from "../modles/user.model.js"
 import { ApiResponse } from "../utils/ApiResponse.js";
 import {uplodeOnCloudinary} from "../utils/cloudinary.js"
 import jwt from "jsonwebtoken"
import mongoose, { trusted } from "mongoose";



const generateAccessAndRefreshToken =async(userId)=>{
    try {
        const user =await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefereshToken()

        user.refreshToken=refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new APIError(500,"Some thing went wrong whie genratin refresh and access token")
    }
}

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
const loginUser =asyncHandler(async (req,res)=>{
    const {email,username,password}= req.body
    if (!username && !email) {
        throw new APIError(400,"username or email is required")
    }

    const user = await User.findOne({
        $or:[{username},{email}]
    })

    if(!user){
        throw new APIError(404,"User does not exist")
    }

    const isPasswordVaild = await user.isPasswordCorrect(password)

    if(!isPasswordVaild){
        throw new APIError(401,"Invalid User credentials")
    }

    const {accessToken, refreshToken} = await 
    generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id)
    .select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken,
                refreshToken
            },
            "User lodded in Successfully"
        )
    )
    
})
const logoutUser = asyncHandler(async(req,res)=>{
   User.findByIdAndUpdate(
    req.user._id,
   {
    $set:{
        refreshToken: undefined
    }
   },
   {
    new:true
   }
   )
   const options = {
    httpOnly: true,
    secure: true
  }
  return res
  .status(200)
  .clearCookie("accessToken",options)
  .clearCookie("refreshToken",options)
  .json(new ApiResponse(200,{},"userlogged Out"))
})


const refreshAccessToken = asyncHandler(async(req,res)=>{
   const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

   if (!incomingRefreshToken) {
     throw new APIError(401,"unauthorized request")
   }

   try {
    const decodedToken = jwt.verify(
     incomingRefreshToken,
     process.env.REFRESH_TOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
 
    if (!user) {
     throw new APIError(401,"invalid request Tken")
    }
 
    if (incomingRefreshToken != user?.refreshAccessToken){
     throw new APIError(401,"refresh token is expiredd or used ")
    }
 
    const options = {
     httpOnly:true,
     secure:true
    }
 
  const {accessToken,newRefreshToken}=await 
  generateAccessAndRefreshToken(user._id)
 
 return res
 .status(200)
 .cookies("accessToken",options)
 .cookies("refreshToken",options)
 .json (
     new ApiResponse(
         200,
         {accessToken,refreshToken:newRefreshToken},
         "Access token refreshed"
     )
 )
   } catch (error) {
    throw new APIError(401,error?.message || "Invalid refresh token");
    
   }
 
})
 export {registerUser
    ,loginUser,
    logoutUser,
    refreshAccessToken
 }