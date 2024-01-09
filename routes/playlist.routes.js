import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { addVideoToPlaylist, createPlaylist, getUserPlaylists } from "../controllers/playlist.controller.js";


const router = Router();

router.route('/').post(verifyJWT, createPlaylist);
router.route('/').get(verifyJWT, getUserPlaylists);
router.route('/add/:videoId/:playlistId').patch(verifyJWT, addVideoToPlaylist);

export default router;