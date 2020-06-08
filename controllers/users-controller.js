const { validationResult } = require("express-validator");

const HttpError = require("../models/http-error");
const User = require("../models/user");

const getUsers = async (req, res, next) => {
	let users;
	try {
		users = await User.find({}, "-password");
	} catch (error) {
		return next(new HttpError("Failed to find any users", 500));
	}
	res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs", 422));
	}

	const { name, email, password } = req.body;

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
		schedules: [],
		status: "public",
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
