const express = require("express");
const { check } = require("express-validator");

const schedulesControllers = require("../controllers/schedules-controller");
const checkAuth = require("../middlewear/check-auth");

const router = express.Router();

router.get("/:sid", schedulesControllers.getScheduleById);

router.get("/display/:sid/:day", schedulesControllers.getScheduleByIdByDay);

router.use(checkAuth);

router.get("/user/:uid", schedulesControllers.getSchedulesByUser);

router.post(
	"/",
	[
		check("title").not().isEmpty(),
		check("description").isLength({ min: 10 }),
		check("daysQty").isNumeric(),
		check("scheduleList.*.presenter").not().isEmpty(),
		check("scheduleList.*.day").toInt(),
	],
	schedulesControllers.createSchedule
);

router.patch(
	"/:sid",
	[check("title").not().isEmpty(), check("description").isLength({ min: 10 })],
	schedulesControllers.updateSchedule
);

router.delete("/:sid", schedulesControllers.deleteSchedule);

module.exports = router;
