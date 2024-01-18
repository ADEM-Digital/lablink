import express from "express";
import dotenv from "dotenv";
import AWS from "aws-sdk";
import { Service } from "../models/Service.model";
import { ObjectId } from "mongodb";
import axios, { AxiosResponse } from "axios";
import { AuthUser } from "../types/AuthUser";
import {
  buildServiceUpdateEmailBody,
  sendServiceConfirmationEmail,
  sendServiceUpdateEmail,
} from "../services/nodemailer/nodemailer";

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const router = express.Router();

/* GET home page. */
router.post("/upload", async (req, res, next) => {
  try {
    const { serviceId } = req.query;
    if (serviceId) {
      const s3 = new AWS.S3();
      //   @ts-ignore
      const file = req.files?.file.data;

      const fileContent = Buffer.from(file, "binary");

      const params = {
        Bucket: "lablink-adem",
        //   @ts-ignore
        Key: req.files?.file.name,
        Body: fileContent,
        //   ContentType: "application/pdf",
      };

      s3.upload(
        params,
        async (err: Error, data: AWS.S3.ManagedUpload.SendData) => {
          if (err) {
            console.error("Error", err);
            next(err);
          } else {
            console.log("Upload Success", data.Location);
        
            const updatedServiceResult = await Service.updateOne(
              { _id: serviceId },
              { $set: { results: data.Location, status: "results uploaded" } }
            );
            const updatedService = await Service.findById(serviceId).populate([
              { path: "tests" },
              { path: "user" },
            ]);

            const options = {
              method: "GET",
              // @ts-ignore
              url: `https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users/${updatedService?.user?.userId}`,
              // params: {q: `user_id:"${newServiceDocument.user?._id.toString()}"`},
              headers: {
                authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
              },
            };
            const response: AxiosResponse<AuthUser> = await axios.request(
              options
            );

            const emailBody = await buildServiceUpdateEmailBody(
              // @ts-ignore
              updatedService?._id.toString(),
              // @ts-ignore
              updatedService?.tests.map((test) => test._doc),
              `${process.env.SERVER_ORIGIN}/v1/services/redirect/${serviceId}`
            );

            await sendServiceUpdateEmail(response.data.email, emailBody);

            res.status(200).json(updatedService);
          }
        }
      );
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json("Failed to upload the file.");
  }
});

export default router;
