import express from "express";
import {getProfile,createProfile,updateProfile,deleteProfile,} from "../controllers/profile-controller.js";
import auth from "../middlewares/authentication.js";

const router = express.Router();

router.route("/")
    .get(auth, getProfile)
    .post(auth, createProfile) 
    .put(auth, updateProfile) 
    .delete(auth, deleteProfile); 

export default router;
