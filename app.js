import  express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";


const app = express()   


//middleware

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));


app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static("public"))
app.use(cookieParser())

//routes import
import userRoutes from "./routes/users.routes.js"
import videoRoutes from "./routes/videos.routes.js"
import notesRoutes from "./routes/notes.routes.js"


app.use("/api/v1/users", userRoutes)
app.use("/api/v1/videos", videoRoutes)
app.use("/api/v1/notes", notesRoutes)


export default app