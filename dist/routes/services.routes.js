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
const mongoose_1 = __importDefault(require("mongoose"));
const router = express_1.default.Router();
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Should have a body
    // Should create a new service based on the info of the req.body
    // On success returns the created MongoDB document with a 201 status code
    // Should handle errors accordingly
    if (!req.body.hasOwnProperty("user"))
        return res.status(400).json("Bad request. The request should have a body.");
    try {
        let newServiceDocument = yield Service_model_1.Service.create(req.body);
        return res.status(201).json(newServiceDocument);
    }
    catch (error) {
        console.error("Failed to create service", error);
        return res.status(500).json("Failed to create a service");
    }
}));
router.get("/user/:userId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
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
            else if (profile.role !== "staff") {
                return res.status(500).json("The user has an invalid role.");
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
        return res.status(500).json("Failed to fetch services");
    }
}));
router.put("/:serviceId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Given a valid service id
    // Should return a MongoDB update response
    // The update count should be equal to one
    // The matched count should be equal to one
    // Errors should be handled
    // Should return 400 if an invalid service id is provided
    const { serviceId } = req.params;
    try {
        let documentExists = null;
        if (mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
            documentExists = yield Service_model_1.Service.exists({ _id: serviceId });
        }
        else {
            return res
                .status(400)
                .json("Bad request. The provided service id is not a valid ObjectId string.");
        }
        if (!documentExists) {
            return res
                .status(400)
                .json("Bad request. The provided serviceId doesn't exist in the database");
        }
        if (Object.keys(req.body).length < 1) {
            return res
                .status(400)
                .json("Bad request. The request must have a valid request body.");
        }
        let updateResponse = yield Service_model_1.Service.findOneAndUpdate({ _id: serviceId }, { $set: req.body }, { runValidators: true });
        return res.status(200).json(updateResponse);
    }
    catch (error) {
        console.error("Failed to update the service: \n\n %s", error);
        return res.status(500).json("Failed to update the service");
    }
}));
router.delete("/:serviceId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Should receive a valid service id as a parameter
    // Check if the received service id is a valid ObjectId
    // Check if the received service id exists
    // Must send a 400 status for the invalid values of service id
    // Must delete the provided service id
    // Must return a 200 status code with a MongoDB delete result
    // Must handle all errors
    const { serviceId } = req.params;
    try {
        let documentExists;
        if (mongoose_1.default.Types.ObjectId.isValid(serviceId)) {
            documentExists = yield Service_model_1.Service.exists({ _id: serviceId });
            if (!documentExists) {
                return res
                    .status(400)
                    .json("Bad request. The provided ObjectId doesn't exist in the database.");
            }
        }
        else {
            return res
                .status(400)
                .json("Bad request. The provided service id is not a valid ObjectId string.");
        }
        let deleteResult = yield Service_model_1.Service.deleteOne({ _id: serviceId });
        return res.status(200).json(deleteResult);
    }
    catch (error) {
        console.error("Failed to delete the service \n\n %s", error);
        return res.status(500).json("Failed to delete the service");
    }
}));
exports.default = router;
