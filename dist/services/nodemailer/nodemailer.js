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
exports.sendServiceConfirmationEmail = exports.buildServiceConfirmationEmailBody = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let transporter = nodemailer_1.default.createTransport({
    host: 'smtppro.zoho.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD
    }
});
const buildServiceConfirmationEmailBody = (serviceId, testsList) => __awaiter(void 0, void 0, void 0, function* () {
    const body = `
    <h1>LabLink - Service Information</h1>

    <p>A new service has been created in our system with id <b>${serviceId}</b>.</p>

    <p>This service includes the following tests:</p>
    <ul>
    ${testsList.map((test) => {
        console.log(test);
        return `<li><b>${test.name}</b>. Average result time: ${test.resultTime}</li>`;
    }).join("")}
    </ul>
    <p>You will receive updates about the status of your results.</p>

    <p>You can check the status of your service at <a href="${process.env.LABLINK_CLIENT_URL}">${process.env.LABLINK_CLIENT_URL}</a>.</p>
    `;
    return body;
});
exports.buildServiceConfirmationEmailBody = buildServiceConfirmationEmailBody;
const sendServiceConfirmationEmail = (destinationEmail, emailBody) => __awaiter(void 0, void 0, void 0, function* () {
    const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: destinationEmail,
        subject: "LabLink - Information about your upcoming lab results",
        html: emailBody
    };
    try {
        const response = yield transporter.sendMail(mailOptions);
        console.log(response);
    }
    catch (error) {
        console.error("Failed to send email %s", error);
    }
});
exports.sendServiceConfirmationEmail = sendServiceConfirmationEmail;
