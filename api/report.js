export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name1, date1, time1, place1, name2, date2, time2, place2 } = req.body;

  function formatDate(dateStr) {
    if (!dateStr) return 'desconocida';
    const [year, month, day] = dateStr.split('-');
    const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
    return `${parseInt(day)} de ${months[parseInt(month)-1]} de ${year}`;
  }

  function getSign(dateStr) {
    if (!dateStr) return '';
    const [, month, day] = dateStr.split('-').map(Number);
    const signs = [
      [1,20,'Capricornio'],[2,19,'Acuario'],[3,20,'Piscis'],[4,20,'Aries'],
      [5,21,'Tauro'],[6,21,'Géminis'],[7,23,'Cáncer'],[8,23,'Leo'],
      [9,23,'Virgo'],[10,23,'Libra'],[11,22,'Escorpio'],[12,22,'Sagitario'],[12,31,'Capricornio']
    ];
    for (const [m, d, sign] of signs) {
      if (month < m || (month === m && day <= d)) return sign;
    }
    return 'Capricornio';
  }

  const sign1 = getSign(date1);
  const sign2 = getSign(date2);

  const prompt = `Eres Cristina, creadora de BSecret, guía de tarot psicológico y astrología desde la perspectiva junguiana. Vas a crear un informe de compatibilidad astrológica profundo y personal para dos personas.

DATOS:
- Persona 1: ${name1}, nacida el ${formatDate(date1)}${time1 ? ' a las ' + time1 : ''} en ${place1}. Signo solar: ${sign1}.
- Persona 2: ${name2}, nacida el ${formatDate(date2)}${time2 ? ' a las ' + time2 : ''} en ${place2}. Signo solar: ${sign2}.

Crea un informe de compatibilidad astrológica psicológica completo y profundo en español. El informe debe tener estas secciones claramente marcadas con ## al inicio:

## La naturaleza de esta unión
Una visión general de la energía de esta pareja, qué los une a nivel del alma, qué arquetipo representa esta unión.

## Sintonía emocional y comunicación
Cómo se conectan emocionalmente, cómo se comunican, qué necesitan el uno del otro.

## El vínculo romántico y la atracción
La química, la atracción, lo que enciende el fuego entre ellos.

## Los retos del alma
Los conflictos más probables, los patrones que deberán trabajar juntos, las sombras que esta relación puede activar.

## El potencial de esta unión
Lo que pueden construir juntos, su propósito compartido, hacia dónde puede crecer esta relación.

## Mensaje del alma
Un mensaje poético y profundo de 3-4 líneas para esta pareja.

Escribe en tono íntimo, cálido y profundo. Usa metáforas del alma, referencias junguianas cuando sea natural. Entre 600 y 900 palabras en total. Dirígete a ellos por sus nombres de forma natural.`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.VITE_ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    res.status(200).json({ text, sign1, sign2 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
