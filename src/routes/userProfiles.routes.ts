import express from "express";
import { UserProfile } from "../models/UserProfile.model";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    let userProfiles = await UserProfile.find({});
    return res.status(200).json(userProfiles);
  } catch (error) {
    console.error("Failed to fetch user profiles", error);
    return res.status(500).json("Failed to fetch user profiles");
  }
});

router.post("/", async (req, res, next) => {
  // return an error if req.body is empty
  if (!req.body.hasOwnProperty("userId"))
    return res.status(500).json("Failed to create user profile");
  try {
    let createdDocument = await UserProfile.create(req.body);
    return res.status(201).json(createdDocument);
  } catch (error) {
    console.error("Failed to create user profile", error);
    return res.status(500).json("Failed to create user profile");
  }
});

router.put("/:userProfileId", async (req, res, next) => {
  const { userProfileId } = req.params;

  // return an error if req.body is empty
  if (!req.body.hasOwnProperty("userId"))
    return res.status(500).json("Failed to update user profile");
  try {
    let updatedDocument = await UserProfile.updateOne(
      { _id: userProfileId },
      { $set: req.body }
    );
    return res.status(200).json(updatedDocument);
  } catch (error) {
    console.error("Failed to create user profile", error);
    return res.status(500).json("Failed to create user profile");
  }
});

router.delete("/:userProfileId", async (req, res, next) => {
  const { userProfileId } = req.params;
  try {
    let deleteResult = await UserProfile.deleteOne({ _id: userProfileId });
    return res.status(200).json(deleteResult);
  } catch (error) {
    console.error("Failed to delete the user profile", error);
    return res.status(500).json("Failed to delete the user profile");
  }
});

export default router;
