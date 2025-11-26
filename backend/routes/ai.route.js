import express from "express";
import { verifyToken } from "../utils/verifyUser.js";
import {
    askItineraryChatbot,
    deleteAiItinerary,
    generateAiItinerary,
    getAiItinerary,
    listAiItineraries,
    updateAiItinerary
} from "../controllers/aiItinerary.controller.js";

const router = express.Router();

router.post("/itineraries/generate", verifyToken, generateAiItinerary);
router.get("/itineraries", verifyToken, listAiItineraries);
router.get("/itineraries/:id", verifyToken, getAiItinerary);
router.patch("/itineraries/:id", verifyToken, updateAiItinerary);
router.delete("/itineraries/:id", verifyToken, deleteAiItinerary);
router.post("/chatbot", verifyToken, askItineraryChatbot);

export default router;


