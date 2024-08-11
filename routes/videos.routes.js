import { Router } from "express";
import { deleteVideo, getVideo, myVideos, recentVideos, selectVideos, uploadVideo } from "../controllers/videos.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";






const router = Router()


router.post("/uploadVideo",verifyJWT , upload.fields([
    {
        name: "videoFile",
        maxCount: 1,
    },
    {
        name: "thumbnail",
        maxCount: 1,
    },
    
]), uploadVideo)

router.post("/recentVideos", recentVideos)
router.post("/selectVideos", selectVideos)
router.get("myVideos/:id", verifyJWT, myVideos)
router.delete("/:videoId", verifyJWT, deleteVideo)
router.get("/:videoId", getVideo)




export default router