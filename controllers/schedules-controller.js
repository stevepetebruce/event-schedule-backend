const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../utilities/location");
const Schedule = require("../models/schedule");
const User = require("../models/user");

const getScheduleById = async (req, res, next) => {
	const scheduleId = req.params.sid;

	let schedule;
	try {
		schedule = await Schedule.findById(scheduleId);
	} catch (error) {
		return next(new HttpError("Failed to find schedule", 500));
	}

	if (!schedule) {
		return next(new HttpError("No schedule was found with this id", 404));
	}
	res.json({ schedule: schedule.toObject({ getters: true }) });
};

const getSchedulesByUser = async (req, res, next) => {
	const userId = req.params.uid;

	let schedules;
	try {
		schedules = await Schedule.find({ creator: userId });
	} catch (error) {
		return next(new HttpError("Failed to find user", 500));
	}

	res.json({ schedules: schedules.map((s) => s.toObject({ getters: true })) });
};

const createSchedule = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs", 422));
	}

	const {
		title,
		description,
		address,
		startDate,
		daysQty,
		scheduleList,
		creator,
	} = req.body;

	let coordinates;
	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}
	const createdSchedule = new Schedule({
		title,
		description,
		address,
		location: coordinates,
		image:
			"https://www.glastonburyfestivals.co.uk/wp-content/uploads/2019/02/gf-logo-2019.png",
		startDate,
		daysQty,
		scheduleList,
		creator,
	});

	let user;
	try {
		user = await User.findById(creator);
	} catch (error) {
		return next(new HttpError("No user found", 500));
	}

	if (!user) {
		return next(new HttpError("No user found to create schedule", 404));
	}

	try {
		const schedSession = await mongoose.startSession();
		schedSession.startTransaction();
		await createdSchedule.save({ session: schedSession });
		user.schedules.push(createdSchedule);
		await user.save({ session: schedSession });
		await schedSession.commitTransaction();
	} catch (error) {
		return next(new HttpError("Failed to create new schedule", 500));
	}

	res.status(201).json({ schedule: createdSchedule });
};

const updateSchedule = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs", 422));
	}

	const { title, description, startDate, daysQty, scheduleList } = req.body;
	const scheduleId = req.params.sid;

	let schedule;
	try {
		schedule = await Schedule.findById(scheduleId);
	} catch (error) {
		return next(new HttpError("Failed to find schedule", 500));
	}

	schedule.title = title;
	schedule.description = description;
	schedule.startDate = startDate;
	schedule.daysQty = daysQty;
	schedule.scheduleList = scheduleList;

	try {
		await schedule.save();
	} catch (error) {
		return next(new HttpError("Failed to update schedule", 500));
	}

	res.status(200).json({ schedule: schedule.toObject({ getters: true }) });
};

const deleteSchedule = async (req, res, next) => {
	const scheduleId = req.params.sid;
	let schedule;
	try {
		schedule = await Schedule.findById(scheduleId).populate("creator");
	} catch (error) {
		return next(new HttpError("Error finding schedule", 500));
	}

	if (!schedule) {
		return next(new HttpError("No schedule found to delete", 404));
	}
	try {
		const delSession = await mongoose.startSession();
		delSession.startTransaction();
		await schedule.remove({ session: delSession });
		schedule.creator.schedules.pull(schedule);
		await schedule.creator.save({ session: delSession });
		await delSession.commitTransaction();
	} catch (error) {
		console.log("error", error);
		return next(new HttpError("Failed to delete", 500));
	}

	res.status(200).json({ message: "Deleted Schedule" });
};

exports.getScheduleById = getScheduleById;
exports.getSchedulesByUser = getSchedulesByUser;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
