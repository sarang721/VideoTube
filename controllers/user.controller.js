import mongoose from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser=async(req,res)=>{

    const {fullName, email, userName, password } = req.body

    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        return res.status(409).json(
            new ApiError(400, "All fields are required")
        )
    }

    const existedUser=await User.findOne({
        $or:[{userName},{email}]
    })

    if (existedUser) {

        return res.status(409).json(
            new ApiError(409, "User with email or username already exists")
        )
    }
    //console.log(req.files)

    if(!req.files?.avatar)
    {
        return res.status(400).json(
            new ApiError(400, "Avatar is required")
        )  
    }

    const avatar = await uploadOnCloudinary(req.files?.avatar[0]?.path);
    //console.log(avatar.url)
    let coverImage= null
    if(req.files?.coverImage && req.files?.coverImage[0]?.path.length>0)
    {
        coverImage = await uploadOnCloudinary(req.files?.coverImage[0]?.path);
    }
    
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage==null?"":coverImage.url,
        email, 
        password,
        userName: userName.toLowerCase()
    })

    return res.status(201).json(
        new ApiResponse(201, {}, "User registered Successfully")
    )
}

export {registerUser}