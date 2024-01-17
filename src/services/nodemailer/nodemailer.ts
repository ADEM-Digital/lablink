import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Test } from "../../types/Test";
dotenv.config();

let transporter = nodemailer.createTransport({
    host: 'smtppro.zoho.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.NODEMAILER_USER,
        pass: process.env.NODEMAILER_PASSWORD
    }
});

export const buildServiceConfirmationEmailBody = async (serviceId: string, testsList: Test[]) => {
    const body = `
    <h1>LabLink - Service Information</h1>

    <p>A new service has been created in our system with id <b>${serviceId}</b>.</p>

    <p>This service includes the following tests:</p>
    <ul>
    ${testsList.map((test) => {
        console.log(test)
        return `<li><b>${test.name}</b>. Average result time: ${test.resultTime}</li>`}).join("")}
    </ul>
    <p>You will receive updates about the status of your results.</p>

    <p>You can check the status of your service at <a href="${process.env.LABLINK_CLIENT_URL}">${process.env.LABLINK_CLIENT_URL}</a>.</p>
    `

    return body;
}

export const sendServiceConfirmationEmail = async (destinationEmail: string, emailBody: string) => {
    const mailOptions = {
        from: process.env.NODEMAILER_USER,
        to: destinationEmail,
        subject: "LabLink - Information about your upcoming lab results",
        html: emailBody
    }

    try {
        const response = await transporter.sendMail(mailOptions);
        console.log(response)
    } catch (error) {
        console.error("Failed to send email %s", error);
    }
} 