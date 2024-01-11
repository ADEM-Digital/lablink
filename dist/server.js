"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.server = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("./utils/server"));
const mongodb_1 = __importDefault(require("../src/database/mongodb"));
// Configuration
dotenv_1.default.config();
mongodb_1.default;
const port = process.env.PORT || 3000;
const app = (0, server_1.default)();
console.log("Running server");
exports.server = app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
exports.default = app;
