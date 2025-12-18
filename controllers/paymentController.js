const Plan = require("../models/plan");
const stripe=require("../config/stripe")
exports.createCheckoutSession = async (req, res) => {
  try {
    const { planId } = req.body;

    // 1️⃣ Validate planId
    if (!planId) {
      return res.status(400).json({ error: "planId is required" });
    }

    // 2️⃣ Fetch plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ error: "Plan not found" });
    }

    // 3️⃣ Validate price
    const amount = parseInt(plan.price);
    if (isNaN(amount)) {
      return res.status(400).json({ error: "Plan price is invalid" });
    }

    // 4️⃣ Create Stripe checkout session (2025 Clover Update Compatible)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { name: plan.name },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],

      // ui_mode: "hosted",

      // success_url: "http://localhost:5173/paymentsuccess",
      // cancel_url: "http://localhost:5173/cancel",
       success_url: "https://remote-frontend.onrender.com/paymentsuccess",
      cancel_url:"https://remote-frontend.onrender.com/cancel"
    });

    // 5️⃣ Return URL instead of sessionId (Stripe 2025 requirement)
    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe Error:", err);
    res.status(500).json({ error: err.message });
  }
};







// exports. createCheckoutSession = async (req, res) => {
//   try {
//     const { planId, userId, email } = req.body;

//     // 🔐 Basic validation
//     if (!planId) {
//       return res.status(400).json({ error: "planId is required" });
//     }

//     // 🔎 Fetch plan from DB
//     const plan = await Plan.findById(planId);
//     if (!plan) {
//       return res.status(404).json({ error: "Plan not found" });
//     }

//     const amount = Number(plan.price);
//     if (!amount || amount <= 0) {
//       return res.status(400).json({ error: "Invalid plan price" });
//     }

//     // ✅ Create Stripe Checkout Session (NO subscription, NO webhook)
//     const session = await stripe.checkout.sessions.create({
//       mode: "payment",

//       payment_method_types: ["card"],

//       customer_email: email, // optional but recommended

//       line_items: [
//         {
//           price_data: {
//             currency: "inr",
//             product_data: {
//               name: plan.name,
//               description: `${plan.name} plan for Remote Tracker`,
//             },
//             unit_amount: amount * 100, // INR → paise
//           },
//           quantity: 1,
//         },
//       ],

//       // success_url: `http://localhost:5173/paymentsuccess?session_id={CHECKOUT_SESSION_ID}`,
//       // cancel_url: `http://localhost:5173/pricing`,
//       success_url: `https://remotework-tracker-frontend.onrender.com/paymentsuccess?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `https://remotework-tracker-frontend.onrender.com/pricing`,

//       metadata: {
//         planId: plan._id.toString(),
//         userId: userId || "",
//       },
//     });

//     // 🔁 Send Stripe hosted URL to frontend
//     return res.status(200).json({ url: session.url });
//   } catch (error) {
//     console.error("Stripe Checkout Error:", error);
//     return res.status(500).json({ error: "Payment initiation failed" });
//   }
// };
