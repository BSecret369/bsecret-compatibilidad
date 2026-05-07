export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end();
  
  const { session_id } = req.query;
  if (!session_id) return res.status(400).json({ error: 'Falta session_id' });

  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${session_id}`, {
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
    }
  });

  const session = await response.json();

  if (session.error) {
    return res.status(500).json({ error: session.error.message });
  }

  if (session.payment_status !== 'paid') {
    return res.status(402).json({ error: 'Pago no completado' });
  }

  res.json({ metadata: session.metadata });
}
