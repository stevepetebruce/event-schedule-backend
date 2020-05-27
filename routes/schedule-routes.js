const express = require("express");
const { check } = require("express-validator");

const schedulesControllers = require("../controllers/schedules-controller");

const router = express.Router();

router.get("/:sid", schedulesControllers.getScheduleById);

router.get("/user/:uid", schedulesControllers.getSchedulesByUser);

router.post(
	"/",
	[check("title").not().isEmpty(), check("description").isLength({ min: 10 })],
	schedulesControllers.createSchedule
);

router.patch(
	"/:sid",
	[check("title").not().isEmpty(), check("description").isLength({ min: 10 })],
	schedulesControllers.updateSchedule
);

router.delete("/:sid", schedulesControllers.deleteSchedule);

module.exports = router;
