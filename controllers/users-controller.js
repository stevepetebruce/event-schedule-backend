const { validationResult } = require("express-validator");
const { v4: uuidv4 } = require("uuid");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMYUSERS = [
	{
		id: "U1",
		name: "Fred Bloggs",
		email: "test@test.com",
		password: "testing",
	},
];

const getUsers = (req, res, next) => {
	res.json({ users: DUMMYUSERS });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs", 422));
	}

	const { name, email, password, schedules } = req.body;

	let existingUser;
	try {
		existingUser = await User.findOne({ email: email });
	} catch (error) {
		return next(new HttpError("Failed to find user", 500));
	}

	if (existingUser) {
		return next(new HttpError("User already exists. Please log in", 422));
	}

	const createdUser = new User({
		name,
		email,
		password,
		schedules,
	});

	try {
		await createdUser.save();
	} catch (error) {
		return next(new HttpError("Sign up failed", 500));
	}
	res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let identifiedUser;
	try {
		identifiedUser = await User.findOne({ email: email });
	} catch (error) {
		return next(new HttpError("Could not find user", 500));
	}

	if (!identifiedUser || identifiedUser.password !== password) {
		return next(new HttpError("Log in failed", 401));
	}

	res.json({ message: "logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
