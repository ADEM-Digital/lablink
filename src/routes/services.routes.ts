import express from "express";
import { UserProfile } from "../models/UserProfile.model";
import { ObjectId } from "mongodb";
import { Service } from "../models/Service.model";
import mongoose from "mongoose";
import { Test } from "../models/Test.model";
import axios, { AxiosResponse } from "axios";
import { GetUsers200ResponseOneOfInner } from "auth0";
import twilio from "twilio";
import dotenv from "dotenv";
import {
  sendServiceConfirmationEmail,
  buildServiceConfirmationEmailBody,
} from "../services/nodemailer/nodemailer";
import { AuthUser } from "../types/AuthUser";

dotenv.config();

const router = express.Router();

router.post("/", async (req, res, next) => {
  // Should have a body
  // Should create a new service based on the info of the req.body
  // On success returns the created MongoDB document with a 201 status code
  // Should handle errors accordingly
  if (!req.body.hasOwnProperty("user"))
    return res.status(400).json("Bad request. The request should have a body.");

  try {
    let newServiceDocument = await Service.create(req.body);
    newServiceDocument = await newServiceDocument.populate("user");

    newServiceDocument = await newServiceDocument.populate("tests");

    const options = {
      method: "GET",
      // @ts-ignore
      url: `https://dev-plybq6osko4uqzlz.us.auth0.com/api/v2/users/${newServiceDocument?.user?.userId}`,
      // params: {q: `user_id:"${newServiceDocument.user?._id.toString()}"`},
      headers: {
        authorization: `Bearer ${process.env.AUTH0_MANAGEMENT_TOKEN}`,
      },
    };

    const response: AxiosResponse<AuthUser> = await axios.request(options);
    // @ts-ignore
    const emailBody = await buildServiceConfirmationEmailBody(
      newServiceDocument._id.toString(),
      // @ts-ignore
      newServiceDocument.tests.map((test) => test._doc)
    );

    await sendServiceConfirmationEmail(response.data.email, emailBody);

    return res.status(201).json(newServiceDocument);
  } catch (error) {
    console.error("Failed to create service", error);
    return res.status(500).json("Failed to create a service");
  }
});

router.get("/user/:userId", async (req, res, next) => {
  // Should throw an access denied error if the userId provided is not found
  // Should check for type of user (staff, patient)
  // Results should depend on the type of user
  // Patient should only be able to access data related to his profile
  // Staff has access to information about all services.
  const { userId } = req.params;
  const { status, createdAt } = req.query;

  try {
    const profile = await UserProfile.findOne({ userId }, { _id: 1, role: 1 });
    let filter: {
      user?: mongoose.Types.ObjectId;
      status?: string;
      createdAt?: { $gte: Date; $lte: Date };
    } = {};
    if (status) {
      filter.status = status as string;
    }

    if (createdAt) {
      const startOfDay = new Date(createdAt as string);
      startOfDay.setHours(0, 0, 0, 0); // Set to start of the day

      const endOfDay = new Date(createdAt as string);
      endOfDay.setHours(23, 59, 59, 999); // Set to end of the day

      filter.createdAt = { $gte: startOfDay, $lte: endOfDay };
    }

    if (profile) {
      if (profile.role === "patient") {
        filter.user = profile._id;
      } else if (profile.role !== "staff") {
        return res.status(500).json("The user has an invalid role.");
      }
    } else {
      return res.status(403).json("The provided userId is invalid.");
    }

    const serviceDocuments = await Service.find(filter).populate([
      { path: "tests" },
      { path: "user" },
    ]);

    return res.status(200).json(serviceDocuments);
  } catch (error) {
    console.error("Failed to fetch the services", error);
    return res.status(500).json("Failed to fetch services");
  }
});

router.put("/:serviceId", async (req, res, next) => {
  // Given a valid service id
  // Should return a MongoDB update response
  // The update count should be equal to one
  // The matched count should be equal to one
  // Errors should be handled
  // Should return 400 if an invalid service id is provided
  const { serviceId } = req.params;
  console.log(req.body);
  try {
    let documentExists: { _id: ObjectId } | null = null;
    if (mongoose.Types.ObjectId.isValid(serviceId)) {
      documentExists = await Service.exists({ _id: serviceId });
    } else {
      return res
        .status(400)
        .json(
          "Bad request. The provided service id is not a valid ObjectId string."
        );
    }

    if (!documentExists) {
      return res
        .status(400)
        .json(
          "Bad request. The provided serviceId doesn't exist in the database"
        );
    }

    if (Object.keys(req.body).length < 1) {
      return res
        .status(400)
        .json("Bad request. The request must have a valid request body.");
    }

    let updateResponse = await Service.findOneAndUpdate(
      { _id: serviceId },
      { $set: req.body },
      { runValidators: true }
    );

    return res.status(200).json(updateResponse);
  } catch (error) {
    console.error("Failed to update the service: \n\n %s", error);
    return res.status(500).json("Failed to update the service");
  }
});

router.delete("/:serviceId", async (req, res, next) => {
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
    if (mongoose.Types.ObjectId.isValid(serviceId)) {
      documentExists = await Service.exists({ _id: serviceId });
      if (!documentExists) {
        return res
          .status(400)
          .json(
            "Bad request. The provided ObjectId doesn't exist in the database."
          );
      }
    } else {
      return res
        .status(400)
        .json(
          "Bad request. The provided service id is not a valid ObjectId string."
        );
    }

    let deleteResult = await Service.deleteOne({ _id: serviceId });

    return res.status(200).json(deleteResult);
  } catch (error) {
    console.error("Failed to delete the service \n\n %s", error);
    return res.status(500).json("Failed to delete the service");
  }
});

router.get("/formData", async (req, res, next) => {
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

    const response: AxiosResponse<GetUsers200ResponseOneOfInner[]> =
      await axios.request(options);

    let patientList = await UserProfile.find({ role: "patient" });
    // @ts-ignore
    patientList = patientList.map((patient) => ({
      // @ts-ignore
      ...patient._doc,
      user: response.data.find((user) => user.user_id === patient.userId),
    }));

    const testList = await Test.find({}).sort({ name: 1 });

    const formData = {
      patientList,
      testList,
    };
    return res.status(200).json(formData);
  } catch (error) {
    // @ts-ignore
    console.error("Failed to fetch the services form data %s", error);
    return res.status(500).json("Failed to fetch the services form data");
  }
});

router.post("/lambdaUpdate", async (req, res, next) => {
  const { url } = req.body;
  console.log(url);
  if (!url) {
    return res.status(400).json("Bad request. No url provided.");
  }

  try {
    const updateResponse = await Service.updateOne(
      { results: url },
      { $set: { status: "opened" } }
    );

    return res.status(200).json(updateResponse);
  } catch (error) {
    console.error("Failed to update the service status %s", error);
    return res.status(500).json("Failed to update the service status");
  }
});

router.get("/redirect/:serviceId", async (req, res, next) => {
  const { serviceId } = req.params;

  try {
    const serviceDocument = await Service.findById(serviceId);

    if (!serviceDocument?.results) {
      return res.status(400).json("The provided service doesn't have a result");
    }

    serviceDocument.status = "opened";
    await serviceDocument.save();

    return res.redirect(serviceDocument.results);

  } catch (error) {
    console.log("Failed to redirect the user %s", error)
    return res.status(500).json("Failed to redirect the user.")
  }
});

export default router;

("https://lablink-adem.s3.us-east-2.amazonaws.com/DALL%C3%82%C2%B7E%202024-01-09%2008.45.04%20-%20Portrait%20of%20a%20young%20man%20with%20short%20black%20hair%2C%20wearing%20a%20green%20t-shirt%20and%20a%20confident%20smile%2C%20representing%20a%20studious%20and%20focused%20individual.%20The%20back.png");

("https://lablink-adem.s3.us-east-2.amazonaws.com/DALLA%C3%8C%C2%82%C3%82%C2%B7E%202024-01-09%2008.45.04%20-%20Portrait%20of%20a%20young%20man%20with%20short%20black%20hair%2C%20wearing%20a%20green%20t-shirt%20and%20a%20confident%20smile%2C%20representing%20a%20studious%20and%20focused%20individual.%20The%20back%20%281%29.png");
