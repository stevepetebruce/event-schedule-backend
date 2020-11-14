const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const scheduleSchema = new Schema(
	{
		logo: { type: String },
		title: { type: String, required: true },
		description: { type: String, required: true },
		startDate: { type: Date, required: true },
		daysQty: { type: Number, required: true },
		scheduleList: { type: Array, required: true },
		creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
	},
	{
		timestamps: true,
	}
);

module.exports = mongoose.model("Schedule", scheduleSchema);
