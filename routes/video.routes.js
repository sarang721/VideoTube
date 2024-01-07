import { Router } from "express";
import { deleteVideo, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";
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

router.route('/:videoId').get(verifyJWT,getVideoById).delete(deleteVideo);
router.route('/toggle/publish/:videoId').patch(togglePublishStatus);
router.route('/:videoId').patch(verifyJWT,upload.single('thumbnail'),updateVideo)

export default router;