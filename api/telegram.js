// api/telegram.js
// يبعت رسالة الطلب على تليجرام عن طريق Telegram Bot API.
// التوكن بتاع البوت متخزن في Environment Variable اسمها TELEGRAM_BOT_TOKEN
// في إعدادات المشروع على Vercel (سري، مش ظاهر في كود الموقع أبداً).

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      return res.status(500).json({ error: 'توكن البوت غير مضبوط على السيرفر (TELEGRAM_BOT_TOKEN)' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { chatId, message } = body || {};

    if (!chatId || !message) {
      return res.status(400).json({ error: 'chatId و message مطلوبين' });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    const tgData = await tgRes.json();

    if (!tgData.ok) {
      console.error('Telegram rejected message:', tgData);
      return res.status(502).json({ error: 'تليجرام رفض الرسالة. تأكد من صحة الـ Chat ID وإن البوت متضاف في المحادثة.' });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('telegram API error:', err);
    return res.status(500).json({ error: 'خطأ في السيرفر' });
  }
}
