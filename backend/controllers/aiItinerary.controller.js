import Itinerary from "../models/itinerary.model.js";
import { errorHandler } from "../utils/error.js";
import {
    aiItinerarySchema,
    chatbotSchema,
    generationSchema,
    updateAiItinerarySchema
} from "../utils/aiValidators.js";
import { requestItineraryPlan, requestPoiAnswer } from "../services/llm.service.js";
import { mapDaysToWaypointList } from "../utils/itineraryMapper.js";

const sanitizeArray = (value) => {
    if (!value) return [];
    if (Array.isArray(value)) {
        return value.filter(Boolean).map((item) => String(item).trim()).filter(Boolean);
    }
    return String(value)
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
};

const assertOwnership = (itinerary, user) => {
    if (!itinerary) {
        throw errorHandler(404, "Itinerary not found");
    }
    const isOwner = itinerary.userId === user.id;
    const isAdmin = user?.isAdmin === true;
    if (!isOwner && !isAdmin) {
        throw errorHandler(403, "You are not allowed to access this itinerary");
    }
    return itinerary;
};

export const generateAiItinerary = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(errorHandler(401, "You must be signed in to generate an itinerary"));
        }

        const { prompt, preferences } = generationSchema.parse(req.body);
        const plan = await requestItineraryPlan(prompt, preferences);
        const normalizedPlan = aiItinerarySchema.parse({
            ...plan,
            visibility: "private",
        });

        const days = Array.isArray(normalizedPlan.days) ? normalizedPlan.days : [];
        const waypointList = mapDaysToWaypointList(days);

        const itinerary = new Itinerary({
            userId: req.user.id,
            source: "ai",
            title: normalizedPlan.title,
            summary: normalizedPlan.summary,
            prompt,
            preferences,
            durationDays: normalizedPlan.durationDays,
            budget: normalizedPlan.budget,
            tags: sanitizeArray(normalizedPlan.tags),
            days,
            waypointList,
            visibility: "private",
            status: "draft",
        });

        const saved = await itinerary.save();
        res.status(201).json(saved);
    } catch (error) {
        next(error);
    }
};

export const listAiItineraries = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(errorHandler(401, "Authentication required"));
        }

        const view = req.query.view;
        const projection =
            view === "compact"
                ? "title summary tags updatedAt createdAt status visibility durationDays prompt budget publishedRouteId"
                : undefined;

        const itineraries = await Itinerary.find({ userId: req.user.id, source: "ai" })
            .sort({ updatedAt: -1 })
            .select(projection);

        res.json(itineraries);
    } catch (error) {
        next(error);
    }
};

export const getAiItinerary = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(errorHandler(401, "Authentication required"));
        }

        const itinerary = await Itinerary.findById(req.params.id);
        assertOwnership(itinerary, req.user);

        res.json(itinerary);
    } catch (error) {
        next(error);
    }
};

export const updateAiItinerary = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(errorHandler(401, "Authentication required"));
        }

        const itinerary = await Itinerary.findById(req.params.id);
        assertOwnership(itinerary, req.user);

        const patch = updateAiItinerarySchema.parse(req.body);
        const updates = { ...patch };

        if ("tags" in updates) {
            updates.tags = sanitizeArray(updates.tags);
        }

        if ("days" in updates && Array.isArray(updates.days)) {
            updates.waypointList = mapDaysToWaypointList(updates.days);
        }

        Object.assign(itinerary, updates, { updatedAt: new Date() });
        const saved = await itinerary.save();
        res.json(saved);
    } catch (error) {
        next(error);
    }
};

export const deleteAiItinerary = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(errorHandler(401, "Authentication required"));
        }

        const itinerary = await Itinerary.findById(req.params.id);
        assertOwnership(itinerary, req.user);

        await itinerary.deleteOne();
        res.status(204).end();
    } catch (error) {
        next(error);
    }
};

export const askItineraryChatbot = async (req, res, next) => {
    try {
        if (!req.user) {
            return next(errorHandler(401, "Authentication required"));
        }

        const payload = chatbotSchema.parse(req.body);
        const response = await requestPoiAnswer(payload.question, {
            ...payload.context,
            poiId: payload.poiId,
        });
        res.json(response);
    } catch (error) {
        next(error);
    }
};


