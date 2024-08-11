import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { deleteNotes, myNotes, recentNotes, selectNotes, uploadNotes } from "../controllers/notes.controllers.js";


const router = Router()



router.post("/uploadNotes",verifyJWT , upload.single("notesFile"), uploadNotes)
router.post("/recentNotes", recentNotes)
router.post("/selectNotes", selectNotes)
router.get("/:id", verifyJWT, myNotes)
router.delete("/:notesId", verifyJWT, deleteNotes)






export default router