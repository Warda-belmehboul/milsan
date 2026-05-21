import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dictionaryRouter from "./dictionary";
import tafseehRouter from "./tafseeh";
import proofreadersRouter from "./proofreaders";
import sessionsRouter from "./sessions";
import rhymesRouter from "./rhymes";
import coursesRouter from "./courses";
import quizRouter from "./quiz";
import spellingRouter from "./spelling";
import adminRouter from "./admin";
import ttsRouter from "./tts";
import messagesRouter from "./messages";
import communityRouter from "./community";
import wordOrderingRouter from "./word-ordering";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/dictionary", dictionaryRouter);
router.use("/tafseeh", tafseehRouter);
router.use("/proofreaders", proofreadersRouter);
router.use("/sessions", sessionsRouter);
router.use("/rhymes", rhymesRouter);
router.use("/courses", coursesRouter);
router.use("/quiz", quizRouter);
router.use("/spelling", spellingRouter);
router.use("/admin", adminRouter);
router.use("/tts", ttsRouter);
router.use("/messages", messagesRouter);
router.use("/community", communityRouter);
router.use("/word-ordering", wordOrderingRouter);

export default router;
