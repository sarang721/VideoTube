import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = async(req,res)=>{

    const {title, description} = req.body;

    if(!req.files?.video)
    {
        return res.status(401).json(
            new ApiError(401,"Please select a video to upload")
        )
    }

    if(!req.files?.thumbnail)
    {
        return res.status(401).json(
            new ApiError(401,"Please select a thumbnail")
        )
    }

    try{

    const video = await uploadOnCloudinary(req.files?.video[0]?.path);

    const thumbnail = await uploadOnCloudinary(req.files?.thumbnail[0]?.path)

    const videoObject = {

    videoFile: video.url,
    thumbnail: thumbnail.url,
    title: title,
    description: description,
    duration: video.duration, 
    views: 0,
    isPublished: true,
    owner: req.user?._id,
    }   

    const uploadedVideoDetails = await Video.create(videoObject);

    return res.status(200).json(
        new ApiResponse(200, uploadedVideoDetails, "Video Uploaded")
    )
    }
    catch(e)
      {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
      }   
}

const getVideoById = async(req,res)=>{

    const {videoId} = req.params

    try{
        const videoObject = await Video.findOne({_id:videoId});
        // console.log(videoObject);

        return res.status(200).json(
            new ApiResponse(200,videoObject,"Video fetched")
        )
    }
    catch(e)
    {
        return res.status(401).json(
            new ApiError(401,"Internal Server Error")
        )
    }
}

export {
    publishVideo,
    getVideoById
}