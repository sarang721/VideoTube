import { Router } from "express";
import { getVideoById, publishVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route('/publish-video').post(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount:1
    },
    {
        name: "video",
        maxCount:1
    }
]), publishVideo)


router.route('/:videoId').get(verifyJWT,getVideoById)

export default router;