import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  uplaodOnCloudinary  from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Notes } from "../models/notes.models.js";
import fs from "fs";
import mongoose from "mongoose";
import { log } from "console";




const uploadNotes = asyncHandler(async (req, res) => {

    const notesPath = req.file.path

    if(!notesPath) {
        throw new ApiError(400, "Notes file is required")
    }
    const { title, subject, sem } = req.body
    console.log(req.body)

    if( [title, subject, sem].some(field => field.trim() === "")) {
        await fs.unlinkSync(notesPath);
        throw new ApiError(400, "All fields are required")
        
    }

    if(!req.file) {

        throw new ApiError(400, "Notes file is required")
    }
    console.log(req.file)

    

    const notesFile = await uplaodOnCloudinary(notesPath)

    if(!notesFile) {
        throw new ApiError(500, "Error uploading notes file")
    }

    const notes = await Notes.create({
        title,
        subject,
        department: req.user.department,
        notesFile: notesFile.url,
        user: req.user._id,
        sem
    })

    notes.save()

    if(!notes) {
        await fs.unlinkSync(notesPath);
        throw new ApiError(500, "Error uploading notes")
    }

    return res.status(200)
    .json(new ApiResponse(200,notes, "Notes uploaded successfully"))


})



const recentNotes = asyncHandler(async (req, res) => {

    const dept = req.body.department.toLowerCase()

    const notes = await Notes.aggregate([
        {
            $match: {department: dept}
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            
            }
        },
        {
            $unwind: "$user"
        },
    ])

    if(!notes) {
        throw new ApiError(404, "No videos found")
    }

    return res.status(200)
    .json(new ApiResponse(200, notes, "Recent videos"))

})

const myNotes = asyncHandler(async (req, res) => {

    const userID= req.params.id
    console.log(userID)
    if(!userID) {
        throw new ApiError(400, "User ID is required")
    }

    if(userID !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this page")
    }

    const notes = await Notes.find({user: req.user._id}).sort({createdAt: -1})

    if(!notes) {
        throw new ApiError(404, "No notes found")
    }

    return res.status(200)
    .json(new ApiResponse(200, notes, "My notes"))
})

const deleteNotes = asyncHandler(async (req, res) => {

    console.log(req.params)

    const notes = await Notes.findById( new mongoose.Types.ObjectId(req.params.notesId))

    if(!notes) {
        throw new ApiError(404, "Notes not found")
    }



    if(notes.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this notes")
    }

   
    await Notes.findByIdAndDelete(notes._id)
    .then(() => console.log('Video document deleted'))
    .catch(err => console.error(err));

    return res.status(200)
    .json(new ApiResponse(200, notes, "Notes deleted successfully"))

})

const selectNotes = asyncHandler(async (req, res) => {

    console.log("sdfdsaf")
    const dept = req.body.department.toLowerCase()
    const filter = {}
    if(req.body.subject.trim() !== "") {
        filter.subject = req.body.subject
    }
    filter.department = dept

    const anotherFilter = {}

    if(req.body.faculty.trim() !== "") {
        anotherFilter["user.fullName"] = { $regex: req.body.faculty, $options: "i" }
    }
    




    const notes = await Notes.aggregate([
        
        {
            $match: filter
        },
        {
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user"
            }
        },
        {
            $unwind: "$user"
        },
        {
            $match: anotherFilter
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    


    if(!notes) {
        throw new ApiError(404, "No notes found")
    }

    return res.status(200)
    .json(new ApiResponse(200, notes, "Recent notes"))
    

})


export { uploadNotes,
    recentNotes,
    myNotes,
    deleteNotes,
    selectNotes
}