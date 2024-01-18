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
const Test_model_1 = require("../models/Test.model");
const router = express_1.default.Router();
router.get("/", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // The route should be able retrieve all documents from the tests collection in MongoDB
    // The route should be able to receive optional query params to filter tests
    // Should return a 200 status and an array of retrieved documents
    // The route should handle errors accordingly
    try {
        let testsDocuments = yield Test_model_1.Test.find(req.query);
        return res.status(200).json(testsDocuments);
    }
    catch (error) {
        console.error("Failed to fetch the tests %s", error);
        return res.status(500).json("Failed to fetch the tests.");
    }
}));
exports.default = router;
