const stripe = require("stripe")(
	process.env.STRIPE_PRIVATE_KEY
);

const checkoutController = async (req, res) => {
	const { lookup_key } = req.body;
	try {
		const prices = await stripe.prices.list({
			lookup_keys: [lookup_key],
			expand: ["data.product"],
		});
		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: prices.data[0].id,
					quantity: 1,
				},
			],
			mode: "subscription",
			success_url: `${process.env.DEVELOPMENT_CLIENT_URL}/payment_success`,
			cancel_url: `${process.env.DEVELOPMENT_CLIENT_URL}/payment_failed`,
		});
		console.log(session);
		return res.status(200).json({ subscriptionId: session.id, url: session.url });
	} catch (e) {
		return res.status(500).json({ error: e });
	}
};

const verifyController = (req, res) => {
	const sig = req.headers["stripe-signature"];
	const payload = req.body;
	const webhookSecret = process.env.WEBHOOK_SECRET;

	let event;
	try {
		event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
	} catch (err) {
		response.status(400).send({ error: err });
		return;
	}

	switch (event.type) {
		case "payment_intent.succeeded":
			res.status(200).json({ data: "payment successful" });
			break;
		case "payment_intent.payment_failed":
			res.status(400).json({ error: "payment failed" });
			break;
		default:
			console.log(`Unhandled event type ${event.type}`);
	}
};

const checkPaymentController = async (req, res) => {
	try {
		const ref = await stripe.checkout.sessions.retrieve(req.body.subscriptionId);
		return res.status(200).json({ paymentStatus: ref.payment_status });
	} catch (e) {
		console.error(e);
		res.status(500).json({ error: "internal server error" });
	}
};

module.exports = {
	checkoutController,
	verifyController,
	checkPaymentController,
};
