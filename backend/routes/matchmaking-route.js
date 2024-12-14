import express from "express";
import { getMatches } from "../controllers/matchmaking-controller.js";
import auth from "../middlewares/authentication.js";

const router = express.Router();

router.get("/", auth, getMatches)

export default router;
