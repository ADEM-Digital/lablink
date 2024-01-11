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
const router = express_1.default.Router();
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let userProfiles = yield UserProfile_model_1.UserProfile.find({});
        return res.status(200).json(userProfiles);
    }
    catch (error) {
        console.error("Failed to fetch user profiles", error);
        return res.status(500).json("Failed to fetch user profiles");
    }
}));
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // return an error if req.body is empty
    if (!req.body.hasOwnProperty("userId"))
        return res.status(500).json("Failed to create user profile");
    try {
        let createdDocument = yield UserProfile_model_1.UserProfile.create(req.body);
        return res.status(201).json(createdDocument);
    }
    catch (error) {
        console.error("Failed to create user profile", error);
        return res.status(500).json("Failed to create user profile");
    }
}));
router.put("/:userProfileId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userProfileId } = req.params;
    // return an error if req.body is empty
    if (!req.body.hasOwnProperty("userId"))
        return res.status(500).json("Failed to update user profile");
    try {
        let updatedDocument = yield UserProfile_model_1.UserProfile.updateOne({ _id: userProfileId }, { $set: req.body });
        return res.status(200).json(updatedDocument);
    }
    catch (error) {
        console.error("Failed to create user profile", error);
        return res.status(500).json("Failed to create user profile");
    }
}));
router.delete("/:userProfileId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { userProfileId } = req.params;
    try {
        let deleteResult = yield UserProfile_model_1.UserProfile.deleteOne({ _id: userProfileId });
        return res.status(200).json(deleteResult);
    }
    catch (error) {
        console.error("Failed to delete the user profile", error);
        return res.status(500).json("Failed to delete the user profile");
    }
}));
exports.default = router;
