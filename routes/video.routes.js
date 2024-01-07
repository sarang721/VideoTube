import { Router } from "express";
import { uploadVideo } from "../controllers/video.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();

router.route('/upload-video').post(verifyJWT, upload.fields([
    {
        name: "thumbnail",
        maxCount:1
    },
    {
        name: "video",
        maxCount:1
    }
]), uploadVideo)

export default router;