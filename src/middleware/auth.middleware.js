import {asyncHandler} from "../utils/asyncHandler.js"
import { APIError } from "../utils/ApiError.js"
import jwt from "jsonwebtoken"
import { User } from "../modles/user.model.js"

export const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {
        const token = req.cookies?.accessToken || req.header
        ("Authorization")?.replace("Bearer","")
    
        if (!token) {
            throw new APIError(401,"unauthorized request")
        }
        const decodedToken=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select
        ("-password -refreshToken")
        
        if(!user){
            throw new APIError(401,"Invalid access Token")
        }
    
        req.user = user;
        next()
    } catch (error) {
        throw new APIError (401,error?.message ||"Invalid Access Token")
    }

})