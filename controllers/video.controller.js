import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { uploadOnCloudinary, deleteImageFromCloudinary } from "../utils/cloudinary.js";


const getAllVideos = async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
}

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

        if(videoObject){
        return res.status(200).json(
            new ApiResponse(200,videoObject,"Video fetched")
        )
        }
        else
        {
            return res.status(200).json(
                new ApiResponse(200,{},"Video Not found")
            )
        }
    }
    catch(e)
    {
        return res.status(401).json(
            new ApiError(401,"Internal Server Error")
        )
    }
}

const updateVideo = async (req, res) => {

    const { videoId } = req.params
    const {title, description} = req.body;  

    try{

    const videoObject = await Video.findOne({_id:videoId});
    
    if(!videoObject)
    {
        return res.status(200).json(
            new ApiResponse(200,{},"No Video Found")
        )
    }

    if(videoObject.owner.toString()!==req.user._id.toString())
    {
        return res.status(401).json(
            new ApiError(401,"Not Authorized to update")
        )
    }

    if(title && title.length>0)
    {
        videoObject.title = title;
    }
    if(description && description.length>0)
    {
        videoObject.description = description
    }

    if(req.file)
    {
        await deleteImageFromCloudinary(videoObject?.thumbnail)
        const thumbnail = await uploadOnCloudinary(req.file?.path);
        videoObject.thumbnail = thumbnail?.url
    }

    await videoObject.save();
    return res.status(200).json(
        new ApiResponse(200,videoObject,"Video details updated")
    )
    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }
}

const deleteVideo = async(req, res) => {
    const { videoId } = req.params
    
    try{
        await Video.deleteOne({_id:videoId});
        return res.status(200).json(
            new ApiResponse(200,{},"Video deleted successfully")
        )
    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }
}

const togglePublishStatus = async (req, res) => {
    const { videoId } = req.params
    try{
    const videoObject = await Video.findOne({_id:videoId});

    if(videoObject)
    {
        if(videoObject.isPublished === true)
        {
            videoObject.isPublished = false;
        }
        else
        {
            videoObject.isPublished = true;
        }

        await videoObject.save();

        return res.status(200).json(
            new ApiResponse(200,videoObject,"Video Status toggled successfully")
        )
    }
    else{
        return res.status(200).json(
            new ApiResponse(200,"No Video found")
        )
    }
    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }
}

export {
    publishVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getAllVideos
}