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
const dotenv_1 = __importDefault(require("dotenv"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const Service_model_1 = require("../models/Service.model");
const axios_1 = __importDefault(require("axios"));
const nodemailer_1 = require("../services/nodemailer/nodemailer");
dotenv_1.default.config();
aws_sdk_1.default.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});
const router = express_1.default.Router();
/* GET home page. */
router.post("/upload", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { serviceId } = req.query;
        if (serviceId) {
            const s3 = new aws_sdk_1.default.S3();
            //   @ts-ignore
            const file = (_a = req.files) === null || _a === void 0 ? void 0 : _a.file.data;
            const fileContent = Buffer.from(file, "binary");
            const params = {
                Bucket: "lablink-adem",
                //   @ts-ignore
                Key: (_b = req.files) === null || _b === void 0 ? void 0 : _b.file.name,
                Body: fileContent,
                //   ContentType: "application/pdf",
            };
            s3.upload(params, (err, data) => __awaiter(void 0, void 0, void 0, function* () {
                var _c;
                if (err) {
                    console.error("Error", err);
                    next(err);
                }
                else {
                    console.log("Upload Success", data.Location);
                    const updatedServiceResult = yield Service_model_1.Service.updateOne({ _id: serviceId }, { $set: { results: data.Location, status: "results uploaded" } });
                    const updatedService = yield Service_model_1.Service.findById(serviceId).populate([
                        { path: "tests" },
                        { path: "user" },
                    ]);
                    const options = {
                        method: "GET",
                        // @ts-ignore
                        url: `https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users/${(_c = updatedService === null || updatedService === void 0 ? void 0 : updatedService.user) === null || _c === void 0 ? void 0 : _c.userId}`,
                        // params: {q: `user_id:"${newServiceDocument.user?._id.toString()}"`},
                        headers: {
                            authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
                        },
                    };
                    const response = yield axios_1.default.request(options);
                    const emailBody = yield (0, nodemailer_1.buildServiceUpdateEmailBody)(
                    // @ts-ignore
                    updatedService === null || updatedService === void 0 ? void 0 : updatedService._id.toString(), 
                    // @ts-ignore
                    updatedService === null || updatedService === void 0 ? void 0 : updatedService.tests.map((test) => test._doc), `${process.env.SERVER_ORIGIN}/v1/services/redirect/${serviceId}`);
                    yield (0, nodemailer_1.sendServiceUpdateEmail)(response.data.email, emailBody);
                    res.status(200).json(updatedService);
                }
            }));
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json("Failed to upload the file.");
    }
}));
exports.default = router;
