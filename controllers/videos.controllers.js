import mongoose from "mongoose";
import { User } from "../models/users.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import  uplaodOnCloudinary  from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.models.js";






const uploadVideo = asyncHandler(async (req, res) => {

    const { title, description, subject, sem } = req.body

    if( [ title, description, subject, sem ].some( field => field.trim() === "" )  ) {
        throw new ApiError(400, "All fields are required")
    }

    if(!req.files ){
        throw new ApiError(400, "Video and thumbnail both are required")
    }

    const videoPath = req.files.videoFile[0].path
    const thumbnailPath = req.files.thumbnail[0].path

    if(!videoPath || !thumbnailPath) {
        throw new ApiError(400, "Video and thumbnail both are required")
    }

    const videoFile = await uplaodOnCloudinary(videoPath)
    const thumbnail = await uplaodOnCloudinary(thumbnailPath)

    

    if(!videoFile || !thumbnail) {
        throw new ApiError(500, "Error uploading video or thumbnail")
    }

    const video = await Video.create({
        title,
        description,
        videoFile: videoFile.url,
        thumbnail: thumbnail.url,
        duration: videoFile.duration,
        owner: req.user._id,
        subject,
        department: req.user.department,
        sem
    })

    await video.save()

    if(!video) {
        throw new ApiError(500, "Error uploading video")
    }

    return res.status(200)
    .json(new ApiResponse(200, video, "Video uploaded successfully"))   

})


const recentVideos = asyncHandler(async (req, res) => {
    
    const dept = req.body.department.toLowerCase()

    const videos = await Video.aggregate([
        
        {
            $match: {
                department: dept
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                duration: 1,
                subject: 1,
                department: 1,
                sem: 1,
                videoFile: 1,
                owner: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    department: 1,
                    designation:1,
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    
    if(!videos) {
        throw new ApiError(404, "No videos found")
    }

    return res.status(200)
    .json(new ApiResponse(200, videos, "Recent videos"))

})

const myVideos = asyncHandler(async (req, res) => {

    const userID= req.params.id

    if(!userID) {
        throw new ApiError(400, "User ID is required")
    }

    if(userID !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to view this page")
    }

    const videos = await Video.find({owner: req.user._id}).sort({createdAt: -1})

    if(!videos) {
        throw new ApiError(404, "No videos found")
    }

    return res.status(200)
    .json(new ApiResponse(200, videos, "My videos"))
})

const deleteVideo = asyncHandler(async (req, res) => {

    console.log(req.params)

    const video = await Video.findById(req.params.videoId)

    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    console.log(video);

    if(video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to delete this video")
    }

   
    await Video.findByIdAndDelete(video._id)
    .then(() => console.log('Video document deleted'))
    .catch(err => console.error(err));

    return res.status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"))

})

const getVideo = asyncHandler(async (req, res) => {

    console.log(req.params)
    const myVideo = await Video.aggregate([
        
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.params.videoId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                duration: 1,
                subject: 1,
                department: 1,
                sem: 1,
                videoFile: 1,
                owner: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    department: 1,
                    designation:1,
                }
            }
        }
    ])

    if(!myVideo) {
        throw new ApiError(404, "Video not found")
    }

    return res.status(200)
    .json(new ApiResponse(200, myVideo, "Video"))

})

const selectVideos = asyncHandler(async (req, res) => {

    console.log("sdfdsaf")
    const dept = req.body.department.toLowerCase()
    const filter = {}
    if(req.body.subject.trim() !== "") {
        filter.subject = req.body.subject
    }
    filter.department = dept

    const anotherFilter = {}

    if(req.body.faculty.trim() !== "") {
        anotherFilter["owner.fullName"] =  { $regex: req.body.faculty, $options: "i" }
    }
    




    const videos = await Video.aggregate([
        
        {
            $match: filter
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $match: anotherFilter
        },
        {
            $project: {
                title: 1,
                description: 1,
                thumbnail: 1,
                duration: 1,
                subject: 1,
                department: 1,
                sem: 1,
                videoFile: 1,
                owner: {
                    _id: 1,
                    fullName: 1,
                    username: 1,
                    department: 1,
                    designation:1,
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        }
    ])
    
    if(!videos) {
        throw new ApiError(404, "No videos found")
    }

    return res.status(200)
    .json(new ApiResponse(200, videos, "Recent videos"))

    

})


export { uploadVideo,
         recentVideos,
         myVideos,
         deleteVideo,
         getVideo,
         selectVideos
 }