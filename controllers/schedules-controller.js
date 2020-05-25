const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");

let DUMMYSCHEDULES = [
	{
		id: "s2",
		title: "schedule 2",
		description: "description of test",
		location: {
			lat: 40.7,
			lng: 23.4,
		},
		address: "test",
		creator: "u2",
	},
	{
		id: "s3",
		title: "schedule dfgdfgdfg",
		description: "description of testgdfgdgfd",
		location: {
			lat: 40.7,
			lng: 23.4,
		},
		address: "testggg",
		creator: "u2",
	},
];

const getScheduleById = (req, res, next) => {
	const scheduleId = req.params.sid;
	const schedule = DUMMYSCHEDULES.find((s) => {
		return s.id === scheduleId;
	});
	if (!schedule) {
		return next(new HttpError("No schedule was found", 404));
	}
	res.json({ schedule });
};

const getSchedulesByUser = (req, res, next) => {
	const userId = req.params.uid;
	const schedules = DUMMYSCHEDULES.filter((u) => {
		return u.creator === userId;
	});
	if (!schedules || schedules.length === 0) {
		return next(new HttpError("No user was found", 404));
	}
	res.json({ schedules });
};

const createSchedule = (req, res, next) => {
	const { title, description, coordinates, address, creator } = req.body;
	const createdSchedule = {
		id: uuidv4(),
		title,
		description,
		address,
		location: coordinates,
		creator,
	};
	DUMMYSCHEDULES.push(createdSchedule);
	res.status(201).json({ schedule: createdSchedule });
};

const updateSchedule = (req, res, next) => {
	const { title, description, coordinates, address } = req.body;
	const scheduleId = req.params.sid;
	const updatedSchedule = {
		...coordinates.find((s) => s.id === scheduleId),
	};
	const scheduleIndex = DUMMYSCHEDULES.findIndex((s) => s.id === scheduleId);

	updatedSchedule.title = title;
	updatedSchedule.description = description;
	updatedSchedule.location = coordinates;
	updatedSchedule.address = address;

	DUMMYSCHEDULES[scheduleIndex] = updatedSchedule;
	res.status(200).json({ schedule: updatedSchedule });
};

const deleteSchedule = (req, res, next) => {
	const scheduleId = req.params.sid;
	DUMMYSCHEDULES = DUMMYSCHEDULES.filter((s) => s.id !== scheduleId);
	res.status(200).json({ message: "Deleted Schedule" });
};

exports.getScheduleById = getScheduleById;
exports.getSchedulesByUser = getSchedulesByUser;
exports.createSchedule = createSchedule;
exports.updateSchedule = updateSchedule;
exports.deleteSchedule = deleteSchedule;
