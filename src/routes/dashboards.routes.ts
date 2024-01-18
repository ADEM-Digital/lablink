import express from "express";
import { UserProfile } from "../models/UserProfile.model";
import { Service } from "../models/Service.model";

const router = express.Router();

router.get("/patient/:userId", async (req, res, next) => {
  // Should receive a valid patient userId
  // Should return a 400 error when an invalid user id is provided
  // Should return an object with keys availableResults, pendingResults, recentResults, and recentResultsDetails
  // Should return a 200 status code
  // Should handle errors accordingly
  try {
    const { userId } = req.params;

    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile || userProfile.role !== "patient") {
      return res.status(400).json("Bad request. Provided invalid user id.");
    }

    const availableResults = await Service.countDocuments({
      user: userProfile._id,
      status: { $in: ["results uploaded", "opened"] },
    });
    const pendingResults = await Service.countDocuments({
      user: userProfile._id,
      status: "pending results",
    });
    const recentResultsDetails = await Service.find({
      user: userProfile._id,
      status: { $in: ["results uploaded", "opened"] },
    })
      .sort({ updatedAt: -1 })
      .limit(5);

    const recentResults = recentResultsDetails.length;

    const dashboardData = {
      availableResults,
      pendingResults,
      recentResultsDetails,
      recentResults,
    };

    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Failed to fetch the dashboard data %s", error);
    return res.status(500).json("Failed to fetch the dashboard data");
  }
});

router.get("/staff/:userId", async (req, res, next) => {
  // Should receive a valid patient userId
  // Should return a 400 error when an invalid user id is provided
  // Should return an object with keys completedServices, pendingServices, unopenedServices, and recentServices
  // Should return a 200 status code
  // Should handle errors accordingly

  try {
    const { userId } = req.params;

    const userProfile = await UserProfile.findOne({ userId });
    if (!userProfile || userProfile.role !== "staff") {
      return res.status(400).json("Bad request. Provided invalid user id.");
    }

    const completedServices = await Service.countDocuments({
      status: { $in: ["results uploaded", "opened"] },
    });

    const unopenedServices = await Service.countDocuments({
      status: "results uploaded",
    });

    const pendingServices = await Service.countDocuments({
      status: "pending results",
    });

    const recentServices = await Service.find({
      status: { $in: ["pending results"] },
    })
      .populate([{path: "tests"}, {path: "user"}])
      .sort({ updatedAt: -1 })
      .limit(5);

    const dashboardData = {
      completedServices,
      unopenedServices,
      pendingServices,
      recentServices,
    };

    return res.status(200).json(dashboardData);
  } catch (error) {
    console.error("Failed to fetch the dashboard data %s", error);
    return res.status(500).json("Failed to fetch the dashboard data.");
  }
});

export default router;
