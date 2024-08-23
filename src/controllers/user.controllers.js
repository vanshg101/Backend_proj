 import { asyncHandler } from "../utils/asyncHandler.js";
 import {APIError} from "../utils/ApiError.js"
 import {User} from "../modles/user.model.js"
 import { ApiResponse } from "../utils/ApiResponse.js";
 import {uplodeOnCloudinary} from "../utils/cloudinary.js"

 const registerUser = asyncHandler( async(req,res) =>{
    const {fullName,email,username,password}=req.body
    console.log("email",email);

    if (fullName =="") {
        throw new APIError(400,"fullname is required")
    }
    if (
        [fullName,email,username,password].some((field)=>
        field?.trim ==="")
    ) {
        throw new APIError(400,"All field are required")
    }
    const existedUser=User.findOne({
        $or:[{username},{email}]
    })
    if (existedUser) {
        throw new APIError(409,"User with email or username already exist")
    }
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if (!avatarLocalPath) {
        throw new APIError(400,"Avatar file is required")
    }

    const avatar=await uplodeOnCloudinary(avatarLocalPath)
    const coverImage = await uplodeOnCloudinary(coverImageLocalPath)

    if(!avatar){
        throw new APIError(400,"Avatar file is required")
    }

    const User =await User.create({
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
        new ApiResponse(200,createdUser,"User registered Successfully")
    )

 } )
 export {registerUser}