export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name1, date1, time1, place1, name2, date2, time2, place2, email } = req.body;

  if (!name1 || !date1 || !place1 || !name2 || !date2 || !place2 || !email) {
    return res.status(400).json({ error: 'Faltan campos' });
  }

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      'payment_method_types[0]': 'card',
      'mode': 'payment',
      'customer_email': email,
      'line_items[0][price_data][currency]': 'eur',
      'line_items[0][quantity]': '1',
      'line_items[0][price_data][product_data][name]': '✦ Informe de Compatibilidad BSecret',
      'line_items[0][price_data][product_data][description]': `${name1} & ${name2} · Astrología Psicológica`,
      'metadata[name1]': name1,
      'metadata[date1]': date1,
      'metadata[time1]': time1 || '',
      'metadata[place1]': place1,
      'metadata[name2]': name2,
      'metadata[date2]': date2,
      'metadata[time2]': time2 || '',
      'metadata[place2]': place2,
      'metadata[email]': email,
      'success_url': `${process.env.BASE_URL}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${process.env.BASE_URL}/`,
    }).toString()
  });

  const session = await response.json();

console.log('Respuesta Stripe:', JSON.stringify(session).substring(0, 300));
  if (session.error) {
    console.log('Error Stripe:', session.error);
    return res.status(500).json({ error: session.error.message });
  }

  res.json({ url: session.url });
}
