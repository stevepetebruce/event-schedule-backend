const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../utilities/location");
const Schedule = require("../models/schedule");

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
	if (!schedules || schedules.length === 0) {
		return next(new HttpError("No user was found with this Id", 404));
	}
	res.json({ schedules: schedules.map((s) => s.toObject({ getters: true })) });
};

const createSchedule = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs", 422));
	}

	const { title, description, address, creator } = req.body;

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
		creator,
	});
	try {
		await createdSchedule.save();
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

	const { title, description, address } = req.body;
	const scheduleId = req.params.sid;

	let schedule;
	try {
		schedule = await Schedule.findById(scheduleId);
	} catch (error) {
		return next(new HttpError("Failed to find schedule", 500));
	}

	let coordinates;
	try {
		coordinates = await getCoordsForAddress(address);
	} catch (error) {
		return next(error);
	}

	schedule.title = title;
	schedule.description = description;
	schedule.address = address;
	schedule.location = coordinates;

	try {
		await schedule.save();
	} catch (error) {
		return next(new HttpError("Failed to update schedule", 500));
	}

	res.status(200).json({ schedule: schedule.toObject({ getters: true }) });
};

const deleteSchedule = async (req, res, next) => {
	const scheduleId = req.params.sid;

	try {
		await Schedule.findById(scheduleId).deleteOne();
	} catch (error) {
		return next(new HttpError("Failed to delete schedule", 500));
	}

	res.status(200).json({ message: "Deleted Schedule" });
};

exports.getScheduleById = getScheduleById;
exports.getSchedulesByUser = getSchedulesByUser;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
