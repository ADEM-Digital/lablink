"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const options = {
    method: "GET",
    // @ts-ignore
    url: `https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users/${(_a = newServiceDocument === null || newServiceDocument === void 0 ? void 0 : newServiceDocument.user) === null || _a === void 0 ? void 0 : _a.userId}`,
    // params: {q: `user_id:"${newServiceDocument.user?._id.toString()}"`},
    headers: {
        authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
    },
};
