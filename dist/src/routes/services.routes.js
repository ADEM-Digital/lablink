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
const Test_model_1 = require("../models/Test.model");
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const nodemailer_1 = require("../services/nodemailer/nodemailer");
dotenv_1.default.config();
const router = express_1.default.Router();
router.post("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // Should have a body
    // Should create a new service based on the info of the req.body
    // On success returns the created MongoDB document with a 201 status code
    // Should handle errors accordingly
    if (!req.body.hasOwnProperty("user"))
        return res.status(400).json("Bad request. The request should have a body.");
    try {
        let newServiceDocument = yield Service_model_1.Service.create(req.body);
        newServiceDocument = yield newServiceDocument.populate("user");
        newServiceDocument = yield newServiceDocument.populate("tests");
        const options = {
            method: "GET",
            // @ts-ignore
            url: `https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users/${(_a = newServiceDocument === null || newServiceDocument === void 0 ? void 0 : newServiceDocument.user) === null || _a === void 0 ? void 0 : _a.userId}`,
            // params: {q: `user_id:"${newServiceDocument.user?._id.toString()}"`},
            headers: {
                authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
            },
        };
        const response = yield axios_1.default.request(options);
        // @ts-ignore
        const emailBody = yield (0, nodemailer_1.buildServiceConfirmationEmailBody)(newServiceDocument._id.toString(), 
        // @ts-ignore
        newServiceDocument.tests.map((test) => test._doc));
        yield (0, nodemailer_1.sendServiceConfirmationEmail)(response.data.email, emailBody);
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
    const { status, createdAt } = req.query;
    try {
        const profile = yield UserProfile_model_1.UserProfile.findOne({ userId }, { _id: 1, role: 1 });
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (createdAt) {
            const startOfDay = new Date(createdAt);
            startOfDay.setHours(0, 0, 0, 0); // Set to start of the day
            const endOfDay = new Date(createdAt);
            endOfDay.setHours(23, 59, 59, 999); // Set to end of the day
            filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
        }
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
        const serviceDocuments = yield Service_model_1.Service.find(filter).populate([
            { path: "tests" },
            { path: "user" },
        ]);
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
    console.log(req.body);
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
router.get("/formData", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Should return an object with UserProfiles with role patient and a list of all available Tests
    // Should return a 200 status code
    // Should handle errors accordingly and return a status code 500 when needed
    try {
        // @ts-ignore
        const options = {
            method: "GET",
            url: "https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users",
            // params: {q: 'email:"jane@exampleco.com"', search_engine: 'v3'},
            headers: {
                authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
            },
        };
        const response = yield axios_1.default.request(options);
        let patientList = yield UserProfile_model_1.UserProfile.find({ role: "patient" });
        // @ts-ignore
        patientList = patientList.map((patient) => (Object.assign(Object.assign({}, patient._doc), { user: response.data.find((user) => user.user_id === patient.userId) })));
        const testList = yield Test_model_1.Test.find({}).sort({ name: 1 });
        const formData = {
            patientList,
            testList,
        };
        return res.status(200).json(formData);
    }
    catch (error) {
        console.log(error);
        return res.status(500).json("Failed to fetch the services form data");
    }
}));
router.post("/lambdaUpdate", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { url } = req.body;
    console.log(url);
    if (!url) {
        return res.status(400).json("Bad request. No url provided.");
    }
    try {
        const updateResponse = yield Service_model_1.Service.updateOne({ results: url }, { $set: { status: "opened" } });
        return res.status(200).json(updateResponse);
    }
    catch (error) {
        console.error("Failed to update the service status %s", error);
        return res.status(500).json("Failed to update the service status");
    }
}));
router.get("/redirect/:serviceId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { serviceId } = req.params;
    try {
        const serviceDocument = yield Service_model_1.Service.findById(serviceId);
        if (!(serviceDocument === null || serviceDocument === void 0 ? void 0 : serviceDocument.results)) {
            return res.status(400).json("The provided service doesn't have a result");
        }
        serviceDocument.status = "opened";
        yield serviceDocument.save();
        return res.redirect(serviceDocument.results);
    }
    catch (error) {
        console.log("Failed to redirect the user %s", error);
        return res.status(500).json("Failed to redirect the user.");
    }
}));
exports.default = router;
("https://lablink-adem.s3.us-east-2.amazonaws.com/DALL%C3%82%C2%B7E%202024-01-09%2008.45.04%20-%20Portrait%20of%20a%20young%20man%20with%20short%20black%20hair%2C%20wearing%20a%20green%20t-shirt%20and%20a%20confident%20smile%2C%20representing%20a%20studious%20and%20focused%20individual.%20The%20back.png");
("https://lablink-adem.s3.us-east-2.amazonaws.com/DALLA%C3%8C%C2%82%C3%82%C2%B7E%202024-01-09%2008.45.04%20-%20Portrait%20of%20a%20young%20man%20with%20short%20black%20hair%2C%20wearing%20a%20green%20t-shirt%20and%20a%20confident%20smile%2C%20representing%20a%20studious%20and%20focused%20individual.%20The%20back%20%281%29.png");
