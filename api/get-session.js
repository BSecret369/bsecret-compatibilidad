import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Falta session_id' });

  const session = await stripe.checkout.sessions.retrieve(session_id);
  if (session.payment_status !== 'paid') {
    return res.status(402).json({ error: 'Pago no completado' });
  }

  res.json({ metadata: session.metadata });
}
