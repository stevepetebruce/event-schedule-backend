const express = require("express");

const schedulesControllers = require("../controllers/schedules-controller");

const router = express.Router();

router.get("/:sid", schedulesControllers.getScheduleById);

router.get("/user/:uid", schedulesControllers.getSchedulesByUser);

router.post("/", schedulesControllers.createSchedule);

router.patch("/:sid", schedulesControllers.updateSchedule);

router.delete("/:sid", schedulesControllers.deleteSchedule);

module.exports = router;
