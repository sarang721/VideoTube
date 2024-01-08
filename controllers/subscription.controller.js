import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const toggleSubscription  = async(req,res)=>{

    const { channelId } = req.params;
    try{
        const alreadySubscribed = await Subscription.findOne({
            $and: [{subscriber:req.user._id},{channel:channelId}]
        })

        if(alreadySubscribed)
        {
            await Subscription.deleteOne({
                $and:[{subscriber:req.user._id},{channel:channelId}]
            })

            return res.status(200).json(
                new ApiResponse(200,{},"Subscription removed")
            )
        }

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

// controller to return subscriber list of a channel
const getChannelSubscribers = async(req,res)=>{

    const {channelId} = req.params;

    try{

        const data = await User.aggregate([
            {
                $match:{
                    _id: new mongoose.Types.ObjectId(channelId),
                },
            },
            {
                $lookup:{
                    from: 'subscriptions',
                    localField:'_id',
                    foreignField: 'channel',
                    as:'subscribers',
                    pipeline:[
                        {
                            $lookup:{
                                from:'users',
                                localField:'subscriber',
                                foreignField:'_id',
                                as:'subscriberInfo',
                                pipeline:[
                                    {
                                        $project:{
                                            userName:1,
                                            fullName:1,
                                            email:1,
                                            avatar:1,
                                            coverImage:1
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                $project:{
                    _id:1,
                    userName:1,
                    email:1,
                    fullName:1,
                    avatar:1,
                    coverImage:1,
                    subscribers:1
                }
            }
        ])

        return res.status(200).json(
            new ApiResponse(200,data,"Data fetched")
        )
        
    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal Server Error")
        )
    }




}


const getSubscribedChannels = async(req,res)=>{


}

export {
    getSubscribedChannels,
    toggleSubscription,
    getChannelSubscribers
}