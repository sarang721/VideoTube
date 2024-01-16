import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { 
    getSubscribedChannels,
    getChannelSubscribers,
    toggleSubscription 
} 
from "../controllers/subscription.controller.js";

const router = Router();

router
    .route("/c/:channelId")
    .post(verifyJWT,toggleSubscription)
    .get(verifyJWT,getChannelSubscribers)

router.route("/u/:subscriberId").get(getSubscribedChannels);    

export default router;