const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const DB_USERNAME = process.env.MONGO_DB_USERNAME;
const DB_PASSWORD = process.env.MONGO_DB_ACCESS;
const DB_APPNAME = process.env.MONGO_DB_APP_NAME;

const scheduleRoutes = require("./routes/schedule-routes");
const userRoutes = require("./routes/user-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(bodyparser.json());

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
	next();
});

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

const connectUrl = `mongodb+srv://${DB_USERNAME}:${DB_PASSWORD}@schedulecluster0-pj8ef.mongodb.net/${DB_APPNAME}?retryWrites=true&w=majority`;
const connectConfig = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
};

mongoose
	.connect(connectUrl, connectConfig)
	.then(() => {
		app.listen(process.env.PORT || 5000);
	})
	.catch((error) => {
		console.log(error);
	});
