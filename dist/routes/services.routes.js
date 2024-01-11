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
router.get("/:userId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Should throw an access denied error if the userId provided is not found
    // Should check for type of user (staff, patient)
    // Results should depend on the type of user
    // Patient should only be able to access data related to his profile
    // Staff has access to information about all services.
    const { userId } = req.params;
    try {
        const profile = yield UserProfile_model_1.UserProfile.findOne({ userId }, { _id: 1, role: 1 });
        let filter = {};
        if (profile) {
            if (profile.role === "patient") {
                filter.user = profile._id;
            }
        }
        else {
            return res.status(403).json("The provided userId is invalid.");
        }
        const serviceDocuments = yield Service_model_1.Service.find(filter);
        return res.status(200).json(serviceDocuments);
    }
    catch (error) {
        console.error("Failed to fetch the services", error);
        return res.status(500).json("Failed to fetch the services");
    }
}));
exports.default = router;
