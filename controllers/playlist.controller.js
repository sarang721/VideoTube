import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.models.js";
import { User } from "../models/user.model.js";

const createPlaylist = async(req,res)=>{
    
    const { name, description} = req.body;

    if(name.length<=0)
    {
        return res.status(401).json(
            new ApiError(401,"Name is required")
        )
    }

    if(description.length<=0)
    {
        return res.status(401).json(
            new ApiError(401,"Description is required")
        )
    }

    try{

        const alreadyExists = await Playlist.findOne({name:name});
        if(alreadyExists)
        {
            return res.status(401).json(
                new ApiError(401,"Playlist already exists")
            )
        }


        const playlist = await Playlist.create({
            name: name,
            description:description,
            owner: req.user._id,
        })

        return res.status(200).json(
            new ApiResponse(200,playlist,"Playlist created")
        )
    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }
}

const getUserPlaylists = async(req,res)=>{
    const userId = req.user._id;

    try{

        const data = await User.aggregate([
            {
                $match:{
                    _id:userId
                }
            },
            {   
                $lookup:{
                    from: 'playlists',
                    localField: '_id',
                    foreignField: 'owner',
                    as: 'playlists'
                }
            },
            {
                $project:{
                    _id:1,
                    name:1,
                    userName:1,
                    email:1,
                    fullName:1,
                    avatar:1,
                    coverImage:1,
                    playlists:1
                }
            }
        ])
        
        return res.status(200).json(
            new ApiResponse(200,data,"Playlists fetched")
        )

    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }
}

const addVideoToPlaylist = async(req,res)=>{

    const {playlistId, videoId} = req.params;



}

export {
    createPlaylist,
    getUserPlaylists,
    addVideoToPlaylist
}


