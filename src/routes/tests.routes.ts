import express from "express";
import { Test } from "../models/Test.model";

const router = express.Router();

router.get("/", async (req, res, next) => {
    // The route should be able retrieve all documents from the tests collection in MongoDB
    // The route should be able to receive optional query params to filter tests
    // Should return a 200 status and an array of retrieved documents
    // The route should handle errors accordingly
    
    try {
        let testsDocuments = await Test.find(req.query);

        return res.status(200).json(testsDocuments);

    } catch (error) {
        console.error("Failed to fetch the tests %s", error);
        return res.status(500).json("Failed to fetch the tests.")
    }
})

export default router;