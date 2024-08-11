import connectDB from './db/index.js';
import dotenv from 'dotenv';

dotenv.config({
    path: '../.env'
})



connectDB()
.then(() => {

    app.listen(process.env.PORT || 3000 , () => {
        console.log(`Server is listening on port ${process.env.PORT || 3000}`)
    })
    
})
.catch((error) => { 
    console.log("MongoDB connection error: ", error);
    process.exit(1);
})

import app from './app.js';