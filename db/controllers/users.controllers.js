import { ApiError } from "../utils/ApiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/users.models.js"
import mongoose from "mongoose"
import { ApiResponse } from "../utils/ApiResponse.js"


const generateAccessTokenAndRefreshToken = async (userId) => {
    try{
      const user =   await User.findById(userId)
       const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken;
      await  user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch(error){
        throw new ApiError(500, "Something wnet wrong while generating refresh and access token")
    }
}


const registerUSer = asyncHandler(async (req, res) => {

    const { fullName, username, password, designation, department } = req.body
    console.log("req.body",req.body)

    if( [fullName, username, password,department, designation].some(  field  =>  field?.trim() === "" )  ){
         throw new ApiError(400, "All fields are required")
    }

    const existUser  = await User.findOne({username})
    console.log("existUser",existUser)
    if(existUser) {
        throw new ApiError(400, "User already exists")
    }

    const user  = await User.create({
        fullName,
        username,
        password,
        designation,
        department
    })
console.log("user",user)
    const userCreated = await User.findById(user._id).select("-password -refreshToken")

    if(!userCreated) {
        throw new ApiError(500, "Error creating user")
    }

    return res.status(200)
    .json( new ApiResponse(200, userCreated, "User Created Successfully"))


})

const loginUser = asyncHandler( async (req,res) => {
    //get user details
    // username or email
    //check that all required fields are not empty
    //check that user exists
    //check that password is correct
    // access and refresh token
    // send cookie

    const { username, password } = req.body;
    
    if(!username ){
        throw new ApiError(400, "Username is required")
    }

    const user =await User.findOne({username})
    console.log("user",user)
    if(!user){
        throw new ApiError(404, "User does not exist")
    }
     console.log("Hwllldfdsf")
    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid password")
    }

    const {accessToken, refreshToken} =await generateAccessTokenAndRefreshToken(user._id)

   const loginUser = await User.findById(user._id).select("-password -refreshToken")
   console.log("loginUser",loginUser)

   const options = {
    httpOnly:true,
    secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(new ApiResponse(200, {
                user: loginUser,
                accessToken,
                refreshToken
                
                 
            }, "User logged in successfully"))

})

const logoutUser = asyncHandler( async (req,res) => {
  await  User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly:true,
        secure: true
       }

       return res
       .status(200)
       .clearCookie("accessToken", options)
       .clearCookie("refreshToken", options)
       .json(new ApiResponse(200, {}, "User logged out successfully"
       ))

})

const refreshAccessToken = asyncHandler( async (req,res) => {
    console.log(req.cookies)
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

   try {
    const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
 
    const user = await User.findById(decodedToken._id)
 
     if(!user){
         throw new ApiError(401, "Invalid RefreshToken") 
     }
 
     if(incomingRefreshToken !== user?.refreshToken) {
         throw new ApiError(401, "RefreshToken has been expired or used") 
     }
 
     const options = {
         httpOnly:true,
         secure: true
        
     }
 
    const {accessToken, newRefreshToken} = await generateAccessTokenAndRefreshToken(user._id)
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken",newRefreshToken,options)
    .json(
         new ApiResponse(200,
             {accessToken, refreshToken: newRefreshToken},
             "Access Token refreshed successfully"
         )
    )
 
   } catch (error) {
        throw new ApiError(401, "Invalid refreshToken")
   }
})

const changeCurrentPassword = asyncHandler( async (req, res) => {
    
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)
    
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200)
        .json(
            new ApiResponse(200, {}, "Password changed successfully")
        )
    
    
})


const getCurrentUser = asyncHandler( async (req, res) => {
        return res.status(200).json(
            new ApiResponse(200, req.user, "User retrieved successfully")
        )
})

export { registerUSer, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser}