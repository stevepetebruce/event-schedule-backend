const axios = require("axios");

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

const HttpError = require("../models/http-error");

const getCoordsForAddress = async (address) => {
	const response = await axios.get(
		`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
			address
		)}&key=${API_KEY}`
	);

	if (!response.data || response.data.status === "ZERO_RESULTS") {
		return next(
			new HttpError("Could not find location for the specified address", 422)
		);
	}

	const coordinates = response.data.results[0].geometry.location;
	return coordinates;
};

module.exports = getCoordsForAddress;
