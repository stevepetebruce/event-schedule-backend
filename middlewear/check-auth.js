const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const MY_JWT = process.env.MY_JWT;

const HttpError = require("../models/http-error");

module.exports = (req, res, next) => {
	if (req.method === "OPTIONS") {
		return next();
	}
	try {
		const token = req.headers.authorization.split(" ")[1];
		if (!token) {
			throw new Error("Authentication Failed");
		}
		const decodedToken = jwt.verify(token, MY_JWT);
		req.userData = { userId: decodedToken.userId };
		next();
	} catch (err) {
		const error = HttpError("Authentication failed", 401);
		return next(error);
	}
};
