import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
    {
           title: {
                type: String,
                required: true,
                trim: true,
            },
            description: {
                type: String,
                trim: true,
            },
            videoFile: {  //cloudinary url
                type: String,
                required: true,
            },
            thumbnail: {        //cloudinary url
                type: String,
                required: true,
            },
            duration: {
                type: String,  // from cloudinary response
                required: true,
                trim: true,
            },
            views: {
                type: Number,
                default: 0,
            },
            owner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            subject: {
                type: String,
                required: true,
            },
            department: {
                type: String,
                required: true,
            },
            sem: {
                type: String,
                required: true,
            }
    }
    ,{timestamps:true})



export const Video = mongoose.model("Video", videoSchema);