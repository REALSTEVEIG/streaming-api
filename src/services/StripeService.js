const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY_LIVE);
class StripeService {
  constructor({ httpHandler }) {
    this.httpHandler = httpHandler;
  }

  async createPaymentIntent(data) {
    // console.log("Data from the front end", data);
    
    let result = await stripe.paymentIntents.create({
      amount: (data.amount && !isNaN(data.amount) ? parseInt(Number(data.amount) * 100) : 0),
      currency: "eur", // Set currency to "eur" for Euro payments
      payment_method_types: ["card"],
      metadata: { cart_id: data.cart_id },
      statement_descriptor: "Partnership payment",
    });

    // console.log("Client secret:", result.client_secret); 
    console.log("Result:", result); 
    return {
      success: false,
      message: "Intent created.",
      status: this.httpHandler.HANDLED,
      stack: null,
      data: result?.client_secret,
    };
  }
}

module.exports = StripeService;
