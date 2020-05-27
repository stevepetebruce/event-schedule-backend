const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const { validationResult } = require("express-validator");

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

const signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return next(new HttpError("Invalid inputs", 422));
	}

	const { name, email, password } = req.body;

	const hasUser = DUMMYUSERS.find((u) => u.email === email);
	if (hasUser) {
		return next(new HttpError("Email is currently in use", 422));
	}

	const createdUser = {
		id: uuidv4(),
		name,
		email,
		password,
	};

	DUMMYUSERS.push(createdUser);
	res.status(201).json({ user: createdUser });
};

const login = (req, res, next) => {
	const { email, password } = req.body;
	const identifiedUser = DUMMYUSERS.find((u) => u.email === email);

	if (!identifiedUser || identifiedUser.password !== password) {
		return next(new HttpError("Could not identify user", 401));
	}
	res.json({ message: "logged in" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
