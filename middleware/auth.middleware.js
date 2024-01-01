import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const verifyJWT = async(req,res,next)=>{

    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    //console.log(token);

    if(!token)
    {
        return res.status(401).json(
            new ApiError(401,"Unauthorized request")
        )   
    }
    
    try{

    let decodedToken = null;
    try{

        decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    // console.log(decodedToken);
    }
    catch(e)
    {
        return res.status(401).json(
            new ApiResponse(401,"Invalid access token")
        )
    }
        
        const user = await User.findById(decodedToken?._id)

        // const user = await User.findOne({
        //     _id:decodedToken?._id
        // })

        if(!user)
        {
            return res.status(401).json(
                new ApiError(401,"Invalid access token")
            ) 
        }

        req.user=user;
        
        next();
    }
    catch(e)
    {
        return res.status(500).json(
            new ApiError(500,"Internal server error")
        ) 
    }

}

export {verifyJWT}