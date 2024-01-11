"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const index_1 = __importDefault(require("../routes/index"));
const userProfiles_1 = __importDefault(require("../routes/userProfiles"));
const createServer = () => {
    const app = (0, express_1.default)();
    const allowedOrigins = [
        "https://certassist-client.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ];
    const corsOptions = {
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.indexOf(origin) !== -1) {
                callback(null, true);
            }
            else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        optionsSuccessStatus: 200,
    };
    app.use((0, morgan_1.default)("dev"));
    app.use(express_1.default.static("public"));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: false }));
    app.use((0, cookie_parser_1.default)());
    app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
    app.use((0, cors_1.default)(corsOptions));
    app.use("/", index_1.default);
    app.use("/v1/userProfiles", userProfiles_1.default);
    return app;
};
exports.default = createServer;
