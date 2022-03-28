require("dotenv/config");
const express = require("express");
const cors = require("cors");
const { verifyController } = require("./controllers/checkout");

(async () => {
	const app = express();
	const port = process.env.PORT || 5000;

	app.use(cors({ origin: "http://localhost:3000" }));

	// for confirmation of payment stripe webhook
	app.post("/webhook", express.raw({ type: "*/*" }), verifyController);

	// for rest of the application
	app.use(express.json());
	app.use("/api/checkout", require("./routes/checkout"));

	await new Promise((resolve) => app.listen(port, resolve));
	console.log(`starting app on port ${port}`);
})();
