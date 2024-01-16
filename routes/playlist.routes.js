import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    addVideoToPlaylist, 
    createPlaylist, 
    deletePlaylist, 
    getUserPlaylists, 
    removeVideoFromPlaylist, 
    updatePlaylist,
    getPlaylistById

} from "../controllers/playlist.controller.js";


const router = Router();

router.route('/').post(verifyJWT, createPlaylist);
router.route('/').get(verifyJWT, getUserPlaylists);
router.route('/add/:videoId/:playlistId').patch(verifyJWT, addVideoToPlaylist);
router.route('/:playlistId').delete(verifyJWT, deletePlaylist);
router.route('/:playlistId').patch(verifyJWT, updatePlaylist);
router.route("/remove/:videoId/:playlistId").patch(verifyJWT, removeVideoFromPlaylist);
router.route('/:playlistId').get(verifyJWT,getPlaylistById);

export default router;