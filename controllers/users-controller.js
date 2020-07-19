const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
	let hashedPassword;
	try {
		hashedPassword = await bcrypt.hash(password, 12);
	} catch (error) {
		return next(new HttpError("Could not create user. Please try again.", 500));
	}

	const createdUser = new User({
		name,
		email,
		password: hashedPassword,
		schedules: [],
		status: "public",
	});

	try {
		await createdUser.save();
	} catch (error) {
		return next(new HttpError("Sign up failed", 500));
	}

	let token;
	try {
		jwt.sign(
			{ userId: createdUser.id, email: createdUser.email },
			"secretjwt_string",
			{ expiresIn: "1h" }
		);
	} catch (error) {
		return next(new HttpError("Sign up failed", 500));
	}

	res
		.status(201)
		.json({ userId: createdUser.id, email: createdUser.email, token: token });
};

const login = async (req, res, next) => {
	const { email, password } = req.body;

	let identifiedUser;
	try {
		identifiedUser = await User.findOne({ email: email });
	} catch (error) {
		return next(new HttpError("Could not find user", 500));
	}

	if (!identifiedUser) {
		return next(new HttpError("Log in failed", 401));
	}

	let isValidPassword = false;
	try {
		isValidPassword = await bcrypt.compare(password, identifiedUser.password);
	} catch (error) {
		return next(
			new HttpError(
				"Could not log you in. Please check you entered your password correctly",
				500
			)
		);
	}

	if (!isValidPassword) {
		return next(new HttpError("Log in failed", 401));
	}

	let token;
	try {
		token = jwt.sign(
			{ userId: identifiedUser.id, email: identifiedUser.email },
			"secretjwt_string",
			{ expiresIn: "1h" }
		);
	} catch (error) {
		return next(new HttpError("Log in failed", 401));
	}

	res.json({
		userId: identifiedUser.id,
		email: identifiedUser.email,
		token: token,
	});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
