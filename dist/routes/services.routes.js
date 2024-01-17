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
const twilio_1 = __importDefault(require("twilio"));
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
        const twilioClient = (0, twilio_1.default)(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        let newServiceDocument = yield Service_model_1.Service.create(req.body);
        newServiceDocument = yield newServiceDocument
            .populate("user");
        newServiceDocument = yield newServiceDocument.populate("tests");
        const options = {
            method: "GET",
            // @ts-ignore
            url: `https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users/${(_a = newServiceDocument === null || newServiceDocument === void 0 ? void 0 : newServiceDocument.user) === null || _a === void 0 ? void 0 : _a.userId}`,
            // params: {q: `user_id:"${newServiceDocument.user?._id.toString()}"`},
            headers: {
                authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwcldtZWRwSHR5OURvc0JjSDY0ZCJ9.eyJpc3MiOiJodHRwczovL2Rldi1wbHlicTZvc2tvNHVxemx6LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJoNGtNQkxMQklqMkgzcE4yYzY0NEVFRENOTVc1b21lRUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtcGx5YnE2b3NrbzR1cXpsei51cy5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTcwNTQ0MTU3MywiZXhwIjoxNzA1NTI3OTczLCJhenAiOiJoNGtNQkxMQklqMkgzcE4yYzY0NEVFRENOTVc1b21lRSIsInNjb3BlIjoicmVhZDpjbGllbnRfZ3JhbnRzIGNyZWF0ZTpjbGllbnRfZ3JhbnRzIGRlbGV0ZTpjbGllbnRfZ3JhbnRzIHVwZGF0ZTpjbGllbnRfZ3JhbnRzIHJlYWQ6dXNlcnMgdXBkYXRlOnVzZXJzIGRlbGV0ZTp1c2VycyBjcmVhdGU6dXNlcnMgcmVhZDp1c2Vyc19hcHBfbWV0YWRhdGEgdXBkYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBkZWxldGU6dXNlcnNfYXBwX21ldGFkYXRhIGNyZWF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgcmVhZDp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfY3VzdG9tX2Jsb2NrcyBkZWxldGU6dXNlcl9jdXN0b21fYmxvY2tzIGNyZWF0ZTp1c2VyX3RpY2tldHMgcmVhZDpjbGllbnRzIHVwZGF0ZTpjbGllbnRzIGRlbGV0ZTpjbGllbnRzIGNyZWF0ZTpjbGllbnRzIHJlYWQ6Y2xpZW50X2tleXMgdXBkYXRlOmNsaWVudF9rZXlzIGRlbGV0ZTpjbGllbnRfa2V5cyBjcmVhdGU6Y2xpZW50X2tleXMgcmVhZDpjb25uZWN0aW9ucyB1cGRhdGU6Y29ubmVjdGlvbnMgZGVsZXRlOmNvbm5lY3Rpb25zIGNyZWF0ZTpjb25uZWN0aW9ucyByZWFkOnJlc291cmNlX3NlcnZlcnMgdXBkYXRlOnJlc291cmNlX3NlcnZlcnMgZGVsZXRlOnJlc291cmNlX3NlcnZlcnMgY3JlYXRlOnJlc291cmNlX3NlcnZlcnMgcmVhZDpkZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmRldmljZV9jcmVkZW50aWFscyBkZWxldGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGNyZWF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgcmVhZDpydWxlcyB1cGRhdGU6cnVsZXMgZGVsZXRlOnJ1bGVzIGNyZWF0ZTpydWxlcyByZWFkOnJ1bGVzX2NvbmZpZ3MgdXBkYXRlOnJ1bGVzX2NvbmZpZ3MgZGVsZXRlOnJ1bGVzX2NvbmZpZ3MgcmVhZDpob29rcyB1cGRhdGU6aG9va3MgZGVsZXRlOmhvb2tzIGNyZWF0ZTpob29rcyByZWFkOmFjdGlvbnMgdXBkYXRlOmFjdGlvbnMgZGVsZXRlOmFjdGlvbnMgY3JlYXRlOmFjdGlvbnMgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDppbnNpZ2h0cyByZWFkOnRlbmFudF9zZXR0aW5ncyB1cGRhdGU6dGVuYW50X3NldHRpbmdzIHJlYWQ6bG9ncyByZWFkOmxvZ3NfdXNlcnMgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIHVwZGF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHJlYWQ6YW5vbWFseV9ibG9ja3MgZGVsZXRlOmFub21hbHlfYmxvY2tzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMgY3JlYXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgZGVsZXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgcmVhZDpjdXN0b21fZG9tYWlucyBkZWxldGU6Y3VzdG9tX2RvbWFpbnMgY3JlYXRlOmN1c3RvbV9kb21haW5zIHVwZGF0ZTpjdXN0b21fZG9tYWlucyByZWFkOmVtYWlsX3RlbXBsYXRlcyBjcmVhdGU6ZW1haWxfdGVtcGxhdGVzIHVwZGF0ZTplbWFpbF90ZW1wbGF0ZXMgcmVhZDptZmFfcG9saWNpZXMgdXBkYXRlOm1mYV9wb2xpY2llcyByZWFkOnJvbGVzIGNyZWF0ZTpyb2xlcyBkZWxldGU6cm9sZXMgdXBkYXRlOnJvbGVzIHJlYWQ6cHJvbXB0cyB1cGRhdGU6cHJvbXB0cyByZWFkOmJyYW5kaW5nIHVwZGF0ZTpicmFuZGluZyBkZWxldGU6YnJhbmRpbmcgcmVhZDpsb2dfc3RyZWFtcyBjcmVhdGU6bG9nX3N0cmVhbXMgZGVsZXRlOmxvZ19zdHJlYW1zIHVwZGF0ZTpsb2dfc3RyZWFtcyBjcmVhdGU6c2lnbmluZ19rZXlzIHJlYWQ6c2lnbmluZ19rZXlzIHVwZGF0ZTpzaWduaW5nX2tleXMgcmVhZDpsaW1pdHMgdXBkYXRlOmxpbWl0cyBjcmVhdGU6cm9sZV9tZW1iZXJzIHJlYWQ6cm9sZV9tZW1iZXJzIGRlbGV0ZTpyb2xlX21lbWJlcnMgcmVhZDplbnRpdGxlbWVudHMgcmVhZDphdHRhY2tfcHJvdGVjdGlvbiB1cGRhdGU6YXR0YWNrX3Byb3RlY3Rpb24gcmVhZDpvcmdhbml6YXRpb25zX3N1bW1hcnkgY3JlYXRlOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgcmVhZDphdXRoZW50aWNhdGlvbl9tZXRob2RzIHVwZGF0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIGRlbGV0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIHJlYWQ6b3JnYW5pemF0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9uX21lbWJlcnMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVycyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyByZWFkOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGRlbGV0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGNyZWF0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgcmVhZDpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyBkZWxldGU6cGhvbmVfcHJvdmlkZXJzIGNyZWF0ZTpwaG9uZV9wcm92aWRlcnMgcmVhZDpwaG9uZV9wcm92aWRlcnMgdXBkYXRlOnBob25lX3Byb3ZpZGVycyBkZWxldGU6cGhvbmVfdGVtcGxhdGVzIGNyZWF0ZTpwaG9uZV90ZW1wbGF0ZXMgcmVhZDpwaG9uZV90ZW1wbGF0ZXMgdXBkYXRlOnBob25lX3RlbXBsYXRlcyBjcmVhdGU6ZW5jcnlwdGlvbl9rZXlzIHJlYWQ6ZW5jcnlwdGlvbl9rZXlzIHVwZGF0ZTplbmNyeXB0aW9uX2tleXMgZGVsZXRlOmVuY3J5cHRpb25fa2V5cyByZWFkOnNlc3Npb25zIGRlbGV0ZTpzZXNzaW9ucyByZWFkOnJlZnJlc2hfdG9rZW5zIGRlbGV0ZTpyZWZyZXNoX3Rva2VucyByZWFkOmNsaWVudF9jcmVkZW50aWFscyBjcmVhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIHVwZGF0ZTpjbGllbnRfY3JlZGVudGlhbHMgZGVsZXRlOmNsaWVudF9jcmVkZW50aWFscyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.jvRPf026S9SO8Wfk3DtIbMx5wE7c56R2ZtJYP1FGfaiZsUoI7yN0LzQvXKRy0thouKVa9pDDZA2C6Fnh8zcR0W93f9GbhswyuHGIBI3ABJPWhIy8mXMRVgu0N4L8sUqxFoWF2wJfHTpbVKqQ8Y578MHNRWJ6XW6ZmQXlHjwM23u6_5gwTjT-FhN7xzEtF3xd2o-G6xdHfPBR_U6s2mJVCn8F-zw6-cZkpvtZRp6VM6cNe-udZ9zj6i7KxVbTFNrVBKLs8tpy0hIF_4f9HlTdqp_H5-_UPohEWd-siWd7hDU_R36NaNVvISCvBiejZh_WJJQVcFqOrJFSb-jeaaTwnA",
            },
        };
        const response = yield axios_1.default.request(options);
        // @ts-ignore
        const emailBody = yield (0, nodemailer_1.buildServiceConfirmationEmailBody)(newServiceDocument._id.toString(), newServiceDocument.tests.map((test) => test._doc));
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
        const serviceDocuments = yield Service_model_1.Service.find(filter).populate("tests");
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
router.get("/formData", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // Should return an object with UserProfiles with role patient and a list of all available Tests
    // Should return a 200 status code
    // Should handle errors accordingly and return a status code 500 when needed
    try {
        const options = {
            method: "GET",
            url: "https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users",
            // params: {q: 'email:"jane@exampleco.com"', search_engine: 'v3'},
            headers: {
                authorization: "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjIwcldtZWRwSHR5OURvc0JjSDY0ZCJ9.eyJpc3MiOiJodHRwczovL2Rldi1wbHlicTZvc2tvNHVxemx6LnVzLmF1dGgwLmNvbS8iLCJzdWIiOiJoNGtNQkxMQklqMkgzcE4yYzY0NEVFRENOTVc1b21lRUBjbGllbnRzIiwiYXVkIjoiaHR0cHM6Ly9kZXYtcGx5YnE2b3NrbzR1cXpsei51cy5hdXRoMC5jb20vYXBpL3YyLyIsImlhdCI6MTcwNTQ0MTU3MywiZXhwIjoxNzA1NTI3OTczLCJhenAiOiJoNGtNQkxMQklqMkgzcE4yYzY0NEVFRENOTVc1b21lRSIsInNjb3BlIjoicmVhZDpjbGllbnRfZ3JhbnRzIGNyZWF0ZTpjbGllbnRfZ3JhbnRzIGRlbGV0ZTpjbGllbnRfZ3JhbnRzIHVwZGF0ZTpjbGllbnRfZ3JhbnRzIHJlYWQ6dXNlcnMgdXBkYXRlOnVzZXJzIGRlbGV0ZTp1c2VycyBjcmVhdGU6dXNlcnMgcmVhZDp1c2Vyc19hcHBfbWV0YWRhdGEgdXBkYXRlOnVzZXJzX2FwcF9tZXRhZGF0YSBkZWxldGU6dXNlcnNfYXBwX21ldGFkYXRhIGNyZWF0ZTp1c2Vyc19hcHBfbWV0YWRhdGEgcmVhZDp1c2VyX2N1c3RvbV9ibG9ja3MgY3JlYXRlOnVzZXJfY3VzdG9tX2Jsb2NrcyBkZWxldGU6dXNlcl9jdXN0b21fYmxvY2tzIGNyZWF0ZTp1c2VyX3RpY2tldHMgcmVhZDpjbGllbnRzIHVwZGF0ZTpjbGllbnRzIGRlbGV0ZTpjbGllbnRzIGNyZWF0ZTpjbGllbnRzIHJlYWQ6Y2xpZW50X2tleXMgdXBkYXRlOmNsaWVudF9rZXlzIGRlbGV0ZTpjbGllbnRfa2V5cyBjcmVhdGU6Y2xpZW50X2tleXMgcmVhZDpjb25uZWN0aW9ucyB1cGRhdGU6Y29ubmVjdGlvbnMgZGVsZXRlOmNvbm5lY3Rpb25zIGNyZWF0ZTpjb25uZWN0aW9ucyByZWFkOnJlc291cmNlX3NlcnZlcnMgdXBkYXRlOnJlc291cmNlX3NlcnZlcnMgZGVsZXRlOnJlc291cmNlX3NlcnZlcnMgY3JlYXRlOnJlc291cmNlX3NlcnZlcnMgcmVhZDpkZXZpY2VfY3JlZGVudGlhbHMgdXBkYXRlOmRldmljZV9jcmVkZW50aWFscyBkZWxldGU6ZGV2aWNlX2NyZWRlbnRpYWxzIGNyZWF0ZTpkZXZpY2VfY3JlZGVudGlhbHMgcmVhZDpydWxlcyB1cGRhdGU6cnVsZXMgZGVsZXRlOnJ1bGVzIGNyZWF0ZTpydWxlcyByZWFkOnJ1bGVzX2NvbmZpZ3MgdXBkYXRlOnJ1bGVzX2NvbmZpZ3MgZGVsZXRlOnJ1bGVzX2NvbmZpZ3MgcmVhZDpob29rcyB1cGRhdGU6aG9va3MgZGVsZXRlOmhvb2tzIGNyZWF0ZTpob29rcyByZWFkOmFjdGlvbnMgdXBkYXRlOmFjdGlvbnMgZGVsZXRlOmFjdGlvbnMgY3JlYXRlOmFjdGlvbnMgcmVhZDplbWFpbF9wcm92aWRlciB1cGRhdGU6ZW1haWxfcHJvdmlkZXIgZGVsZXRlOmVtYWlsX3Byb3ZpZGVyIGNyZWF0ZTplbWFpbF9wcm92aWRlciBibGFja2xpc3Q6dG9rZW5zIHJlYWQ6c3RhdHMgcmVhZDppbnNpZ2h0cyByZWFkOnRlbmFudF9zZXR0aW5ncyB1cGRhdGU6dGVuYW50X3NldHRpbmdzIHJlYWQ6bG9ncyByZWFkOmxvZ3NfdXNlcnMgcmVhZDpzaGllbGRzIGNyZWF0ZTpzaGllbGRzIHVwZGF0ZTpzaGllbGRzIGRlbGV0ZTpzaGllbGRzIHJlYWQ6YW5vbWFseV9ibG9ja3MgZGVsZXRlOmFub21hbHlfYmxvY2tzIHVwZGF0ZTp0cmlnZ2VycyByZWFkOnRyaWdnZXJzIHJlYWQ6Z3JhbnRzIGRlbGV0ZTpncmFudHMgcmVhZDpndWFyZGlhbl9mYWN0b3JzIHVwZGF0ZTpndWFyZGlhbl9mYWN0b3JzIHJlYWQ6Z3VhcmRpYW5fZW5yb2xsbWVudHMgZGVsZXRlOmd1YXJkaWFuX2Vucm9sbG1lbnRzIGNyZWF0ZTpndWFyZGlhbl9lbnJvbGxtZW50X3RpY2tldHMgcmVhZDp1c2VyX2lkcF90b2tlbnMgY3JlYXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgZGVsZXRlOnBhc3N3b3Jkc19jaGVja2luZ19qb2IgcmVhZDpjdXN0b21fZG9tYWlucyBkZWxldGU6Y3VzdG9tX2RvbWFpbnMgY3JlYXRlOmN1c3RvbV9kb21haW5zIHVwZGF0ZTpjdXN0b21fZG9tYWlucyByZWFkOmVtYWlsX3RlbXBsYXRlcyBjcmVhdGU6ZW1haWxfdGVtcGxhdGVzIHVwZGF0ZTplbWFpbF90ZW1wbGF0ZXMgcmVhZDptZmFfcG9saWNpZXMgdXBkYXRlOm1mYV9wb2xpY2llcyByZWFkOnJvbGVzIGNyZWF0ZTpyb2xlcyBkZWxldGU6cm9sZXMgdXBkYXRlOnJvbGVzIHJlYWQ6cHJvbXB0cyB1cGRhdGU6cHJvbXB0cyByZWFkOmJyYW5kaW5nIHVwZGF0ZTpicmFuZGluZyBkZWxldGU6YnJhbmRpbmcgcmVhZDpsb2dfc3RyZWFtcyBjcmVhdGU6bG9nX3N0cmVhbXMgZGVsZXRlOmxvZ19zdHJlYW1zIHVwZGF0ZTpsb2dfc3RyZWFtcyBjcmVhdGU6c2lnbmluZ19rZXlzIHJlYWQ6c2lnbmluZ19rZXlzIHVwZGF0ZTpzaWduaW5nX2tleXMgcmVhZDpsaW1pdHMgdXBkYXRlOmxpbWl0cyBjcmVhdGU6cm9sZV9tZW1iZXJzIHJlYWQ6cm9sZV9tZW1iZXJzIGRlbGV0ZTpyb2xlX21lbWJlcnMgcmVhZDplbnRpdGxlbWVudHMgcmVhZDphdHRhY2tfcHJvdGVjdGlvbiB1cGRhdGU6YXR0YWNrX3Byb3RlY3Rpb24gcmVhZDpvcmdhbml6YXRpb25zX3N1bW1hcnkgY3JlYXRlOmF1dGhlbnRpY2F0aW9uX21ldGhvZHMgcmVhZDphdXRoZW50aWNhdGlvbl9tZXRob2RzIHVwZGF0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIGRlbGV0ZTphdXRoZW50aWNhdGlvbl9tZXRob2RzIHJlYWQ6b3JnYW5pemF0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9ucyBkZWxldGU6b3JnYW5pemF0aW9ucyBjcmVhdGU6b3JnYW5pemF0aW9uX21lbWJlcnMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVycyBkZWxldGU6b3JnYW5pemF0aW9uX21lbWJlcnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyByZWFkOm9yZ2FuaXphdGlvbl9jb25uZWN0aW9ucyB1cGRhdGU6b3JnYW5pemF0aW9uX2Nvbm5lY3Rpb25zIGRlbGV0ZTpvcmdhbml6YXRpb25fY29ubmVjdGlvbnMgY3JlYXRlOm9yZ2FuaXphdGlvbl9tZW1iZXJfcm9sZXMgcmVhZDpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGRlbGV0ZTpvcmdhbml6YXRpb25fbWVtYmVyX3JvbGVzIGNyZWF0ZTpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgcmVhZDpvcmdhbml6YXRpb25faW52aXRhdGlvbnMgZGVsZXRlOm9yZ2FuaXphdGlvbl9pbnZpdGF0aW9ucyBkZWxldGU6cGhvbmVfcHJvdmlkZXJzIGNyZWF0ZTpwaG9uZV9wcm92aWRlcnMgcmVhZDpwaG9uZV9wcm92aWRlcnMgdXBkYXRlOnBob25lX3Byb3ZpZGVycyBkZWxldGU6cGhvbmVfdGVtcGxhdGVzIGNyZWF0ZTpwaG9uZV90ZW1wbGF0ZXMgcmVhZDpwaG9uZV90ZW1wbGF0ZXMgdXBkYXRlOnBob25lX3RlbXBsYXRlcyBjcmVhdGU6ZW5jcnlwdGlvbl9rZXlzIHJlYWQ6ZW5jcnlwdGlvbl9rZXlzIHVwZGF0ZTplbmNyeXB0aW9uX2tleXMgZGVsZXRlOmVuY3J5cHRpb25fa2V5cyByZWFkOnNlc3Npb25zIGRlbGV0ZTpzZXNzaW9ucyByZWFkOnJlZnJlc2hfdG9rZW5zIGRlbGV0ZTpyZWZyZXNoX3Rva2VucyByZWFkOmNsaWVudF9jcmVkZW50aWFscyBjcmVhdGU6Y2xpZW50X2NyZWRlbnRpYWxzIHVwZGF0ZTpjbGllbnRfY3JlZGVudGlhbHMgZGVsZXRlOmNsaWVudF9jcmVkZW50aWFscyIsImd0eSI6ImNsaWVudC1jcmVkZW50aWFscyJ9.jvRPf026S9SO8Wfk3DtIbMx5wE7c56R2ZtJYP1FGfaiZsUoI7yN0LzQvXKRy0thouKVa9pDDZA2C6Fnh8zcR0W93f9GbhswyuHGIBI3ABJPWhIy8mXMRVgu0N4L8sUqxFoWF2wJfHTpbVKqQ8Y578MHNRWJ6XW6ZmQXlHjwM23u6_5gwTjT-FhN7xzEtF3xd2o-G6xdHfPBR_U6s2mJVCn8F-zw6-cZkpvtZRp6VM6cNe-udZ9zj6i7KxVbTFNrVBKLs8tpy0hIF_4f9HlTdqp_H5-_UPohEWd-siWd7hDU_R36NaNVvISCvBiejZh_WJJQVcFqOrJFSb-jeaaTwnA",
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
        console.error("Failed to fetch the services form data %s", error);
        return res.status(500).json("Failed to fetch the services form data");
    }
}));
exports.default = router;
