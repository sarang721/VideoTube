import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js"
import { uploadOnCloudinary, deleteImageFromCloudinary } from "../utils/cloudinary.js";
import jwt, { decode } from "jsonwebtoken";

const registerUser=async(req,res)=>{

    const {fullName, email, userName, password } = req.body

    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        return res.status(409).json(
            new ApiError(400, "All fields are required")
        )
    }

    try{

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

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        return res.status(500).json(
            new ApiError(500, "Something went wrong while registering the user")
        )
    }

    return res.status(201).json(
        new ApiResponse(201, createdUser, "User registered Successfully")
    )
    }

    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server error")
        )
    }
}

const loginUser = async(req,res)=>{

    const {userName, email, password} = req.body;

    if (!userName && !email) {
        return res.status(400).json(
            new ApiError(400, "username or email is required")
        )
    }

    try{
    
    const user = await User.findOne({
        $or:[{userName},{email}]
    })

    if(!user)
    {
        return res.status(404).json(
            new ApiError(404, "User does not exists")
        )   
    }

    //console.log(user._id);

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid)
    {
        return res.status(400).json(
            new ApiError(400, "Invalid credentials")
        )  
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    user.password=undefined

    const options = {
        httpOnly: true,
        secure: true
    }

    // console.log(accessToken)
    // console.log(refreshToken)

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user:user, 
                accessToken:accessToken,
                refreshToken:refreshToken
            },
            "User logged In Successfully"
        )
    )

    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }
}

const logoutUser = async(req,res)=>{
    const user = req.user;
    //console.log(user);

    user.refreshToken = undefined;
    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
}


const refreshAccessToken = async(req,res)=>{
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken;

    if(!incomingToken)
    {
        return res.status(401).json(
            new ApiError(401,"Unauthorized request")
        )
    }

    let decodedToken=null;

   try{
    
        decodedToken = jwt.verify(incomingToken,process.env.REFRESH_TOKEN_SECRET);
   }
   catch(e)
   {
        return res.status(401).json(
        new ApiError(401,"Invalid refresh token")
        )
   }

    try{

    const user = await User.findById(decodedToken._id);

    console.log(user)

    if(!user)
    {
        return res.status(401).json(
            new ApiError(401,"Invalid refresh token")
        )
    }

    const newAccessToken = user.generateAccessToken();
    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;
    await user.save();

    const options = {
        httpOnly: true,
        secure: true
    }

    user.password = undefined;

    return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
        new ApiResponse(200,{
            refreshToken: newRefreshToken,
            accessToken: newAccessToken
        },"Access token refreshed")
    )

    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal server error")
        )
    }



}

const changeCurrentPassword = async(req,res)=>{
        
    const { password } = req.body;
    const user = req.user;

    if(!user)
    {
        return res.status(401).json(
            new ApiError(401,"Unauthorized access")
        )
    }

    try{
    
    user.password = password;
    await user.save({validateBeforeSave: false})    

    user.password = undefined

    return res.status(200).json(
        new ApiResponse(200,user,"Password updated")
    )

    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }

}

const getCurrentUser = (req,res)=>{

    const user = req.user;
    if(!user)
    {
        return res.status(401).json(
            new ApiError(401,"Unauthorized request")
        )
    }

    return res.status(200).json(
        new ApiResponse(200,user,"User fetched successfully")
    )

}

const updateAccountDetails = async(req,res)=>{

    const {userName, email} = req.body;

    try{

        const updatedUser = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                userName: userName,
                email: email
            }
        },
        {
            new:true
        }
        ).select("-password")

        return res.status(200).json(
            new ApiResponse(200,updatedUser,"User details updated")
        )

    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }


}

const updateUserAvatar = async(req,res)=>{

    if(!req.file)
    {
        return res.status(401).json(
            new ApiError(401,"Please select avatar")
        )
    }

    const avatar = await uploadOnCloudinary(req.file?.path);

    if(avatar)
    {   

        try{

            await deleteOldAvatarFromCloudinary(req.user?.avatar);
            
            const updatedProfile = await User.findByIdAndUpdate(req.user._id,
            {
                $set:{
                    avatar: avatar?.url
                }
            },
            {
                new: true
            }).select("-password");

            return res.status(200).json(
                new ApiResponse(200,updatedProfile,"Avatar updated")
            )

        }
        catch(e)
        {
            return res.status(500).json(
                new ApiError(500,"Internal Server Error")
            )
        }

    }

    return res.status(500).json(
        new ApiError(500,"Internal Server Error")
    )

}

const updateUserCoverImage = async(req,res)=>{
    if(!req.file)
    {
        return res.status(401).json(
            new ApiError(401,"Please select coverImage")
        )
    }

    const coverImage = await uploadOnCloudinary(req.file?.path);

    if(coverImage)
    {  
        try{

            await deleteImageFromCloudinary(req.user?.coverImage);
            
            const updatedProfile = await User.findByIdAndUpdate(req.user._id,
            {
                $set:{
                    coverImage: coverImage?.url
                }
            },
            {
                new: true
            }).select("-password");

            return res.status(200).json(
                new ApiResponse(200,updatedProfile,"CoverImage updated")
            )

        }
        catch(e)
        {
            return res.status(500).json(
                new ApiError(500,"Internal Server Error")
            )
        }

    }

    return res.status(500).json(
        new ApiError(500,"Internal Server Error")
    )


}

const getUserChannelProfile = async(req,res)=>{

    const { userName } = req.params;

    if(!userName.trim())
    {
        res.status(401).json(
            new ApiError(401,"Username is missing")
        )
    }

    try{

    const channelData = await User.aggregate([
        {
            $match:{
                userName : userName?.toLowerCase()
            }
        },
        {
            $lookup:{
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup:{
                from: "Subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields:{

                subscribersCount: {
                    $size: "$subscribers"
                },
                channelSubscribedCount:{
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{
                            $in: [req.user?._id, "$subscribers.subscriber"]
                        },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelSubscribedCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                subscribers: 1

            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(200,channelData,"Channel data fetched successfully")
    )

    }
    catch(e)
    {
        return res.status(500).json(
            new ApiResponse(500,"Internal Server Error")
        )
    }

}

const subscribeToChannel = async(req,res)=>{

    const { channelId } = req.body;

    try{

        const subscription = await Subscription.create({
            subscriber: req.user._id,
            channel: channelId
        })

        return res.status(200).json(
            new ApiResponse(200,subscription,"Subscribed successfully")
        )
    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }
}


export {
    registerUser, 
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    subscribeToChannel
}