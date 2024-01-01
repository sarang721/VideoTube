import { Router } from "express";
import { registerUser, 
    loginUser, 
    logoutUser, 
    refreshAccessToken, 
    changeCurrentPassword,
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage,
    subscribeToChannel,
    getUserChannelProfile,
    getWatchHistory,
    testAddVideos
} 
from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route('/register').post(upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]),registerUser);
router.route('/login').post(loginUser);   
router.route('/logout').post(verifyJWT, logoutUser); 
router.route('/refresh-token').post(refreshAccessToken);
router.route('/change-password').post(verifyJWT,changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentUser);
router.route('/update-user').patch(verifyJWT, updateAccountDetails);
router.route('/update-avatar').patch(verifyJWT, upload.single('avatar'), updateUserAvatar);
router.route('/update-coverImage').patch(verifyJWT,upload.single('coverImage'), updateUserCoverImage)
router.route('/channel-info/:userName').post(verifyJWT, getUserChannelProfile);
router.route('/subscribe').post(verifyJWT, subscribeToChannel);
router.route('/watch-history').get(verifyJWT, getWatchHistory);
router.route('/add-video').post(verifyJWT, testAddVideos)

export default router;