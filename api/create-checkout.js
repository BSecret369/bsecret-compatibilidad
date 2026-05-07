import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name1, date1, time1, place1, name2, date2, time2, place2, email } = req.body;

  if (!name1 || !date1 || !place1 || !name2 || !date2 || !place2 || !email) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    customer_email: email,
    line_items: [{
      price_data: {
        currency: 'eur',
        unit_amount: 1495,
        product_data: {
          name: '✦ Informe de Compatibilidad BSecret',
          description: `${name1} & ${name2} · Astrología Psicológica Junguiana`,
        },
      },
      quantity: 1,
    }],
    metadata: { name1, date1, time1: time1||'', place1, name2, date2, time2: time2||'', place2, email },
    success_url: `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BASE_URL}/`,
  });

  res.json({ url: session.url });
}
