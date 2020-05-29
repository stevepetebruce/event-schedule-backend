const express = require("express");
const bodyparser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

const scheduleRoutes = require("./routes/schedule-routes");
const userRoutes = require("./routes/user-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyparser.json());

app.use("/api/schedules", scheduleRoutes);

app.use("/api", userRoutes);

app.use((req, res, next) => {
	const error = new HttpError("Could not find this route", 404);
	return next(error);
});

app.use((error, req, res, next) => {
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || "an unknown error occured" });
});

app.listen(5000);
