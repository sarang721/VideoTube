import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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


const getSubscribedChannels = async(req,res)=>{


}

export {
    getSubscribedChannels,
    toggleSubscription
}