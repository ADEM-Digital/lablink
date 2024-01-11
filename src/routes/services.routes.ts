import express from "express";
import { UserProfile } from "../models/UserProfile.model";
import { ObjectId } from "mongodb";
import { Service } from "../models/Service.model";
import mongoose from "mongoose";



const router = express.Router();

router.get("/:userId", async (req, res, next) => {
    // Should throw an access denied error if the userId provided is not found
    // Should check for type of user (staff, patient)
    // Results should depend on the type of user
    // Patient should only be able to access data related to his profile
    // Staff has access to information about all services.
    const {userId} = req.params;

    try {
        const profile = await UserProfile.findOne({userId}, {_id: 1, role: 1});
        let filter: {user?: mongoose.Types.ObjectId} = {};

        if(profile) {
            if (profile.role === "patient") {
                filter.user = profile._id;
            }
        } else {
            return res.status(403).json("The provided userId is invalid.");
        }

        const serviceDocuments = await Service.find(filter);

        return res.status(200).json(serviceDocuments);
        
    } catch (error) {
        console.error("Failed to fetch the services", error);
        return res.status(500).json("Failed to fetch the services");
    }
})

export default router;