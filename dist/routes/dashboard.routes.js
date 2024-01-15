"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserProfile_model_1 = require("../models/UserProfile.model");
const Service_model_1 = require("../models/Service.model");
const router = express_1.default.Router();
router.get("/patient/:userId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Should receive a valid patient userId
    // Should return a 400 error when an invalid user id is provided
    // Should return an object with keys availableResults, pendingResults, recentResults, and recentResultsDetails
    // Should return a 200 status code
    // Should handle errors accordingly
    try {
        const { userId } = req.params;
        const userProfile = yield UserProfile_model_1.UserProfile.findOne({ userId });
        if (!userProfile || userProfile.role !== "patient") {
            return res.status(400).json("Bad request. Provided invalid user id.");
        }
        const availableResults = yield Service_model_1.Service.countDocuments({
            user: userId,
            status: { $in: ["results uploaded", "opened"] },
        });
        const pendingResults = yield Service_model_1.Service.countDocuments({
            user: userId,
            status: "pending results",
        });
        const recentResultsDetails = yield Service_model_1.Service.find({
            user: userId,
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
    }
    catch (error) {
        console.error("Failed to fetch the dashboard data %s", error);
        return res.status(500).json("Failed to fetch the dashboard data");
    }
}));
exports.default = router;
