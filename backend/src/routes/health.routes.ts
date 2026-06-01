import { Router } from "express";
import { respond } from "./respond";

const router = Router();

router.get("/", respond(() => ({ uptime: process.uptime() })));

export default router;
