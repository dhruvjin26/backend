import mongoose from "mongoose";



const notesSchema = new mongoose.Schema(
    {
        notesFile: {
            type: String,
            required: true,
        },
        user: {
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
        title: {
            type: String,
            required: true,
            trim: true,
        },
        sem: {
            type: String,
            required: true,
        }
    }
    ,{timestamps:true}) 

  export  const Notes = mongoose.model("Notes", notesSchema);