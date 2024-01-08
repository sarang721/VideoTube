import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { getSubscribedChannels,
    toggleSubscription 
} 
from "../controllers/subscription.controller.js";

const router = Router();

router
    .route("/c/:channelId")
    .post(verifyJWT,toggleSubscription);

export default router;