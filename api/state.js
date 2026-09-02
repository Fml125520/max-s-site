// api/state.js
// نقطة API واحدة بتخزن وترجع أي "قسم" من بيانات الموقع (menu, users, whatsapp, payment)
// باستخدام قاعدة بيانات Upstash Redis (بتتربط من Vercel Marketplace -> Storage -> Upstash).
// لما تربط قاعدة البيانات بالمشروع، Vercel بيضيف تلقائياً الـ Environment Variables
// المطلوبة (KV_REST_API_URL و KV_REST_API_TOKEN).

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.kv_KV_REST_API_URL,
  token: process.env.kv_KV_REST_API_TOKEN,
});

// المفاتيح المسموح بالتعامل معها بس (حماية بسيطة عشان محدش يبعت مفتاح عشوائي)
const ALLOWED_KEYS = new Set(['menu', 'users', 'whatsapp', 'payment']);

// بادئة لكل مفتاح عشان لو استخدمت نفس الـ KV database لمشاريع تانية
const PREFIX = 'maxez:';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (!key || !ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: 'مفتاح غير صالح' });
      }
      const value = await redis.get(PREFIX + key);
      return res.status(200).json({ key, value: value ?? null });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const { key, value } = body || {};
      if (!key || !ALLOWED_KEYS.has(key)) {
        return res.status(400).json({ error: 'مفتاح غير صالح' });
      }
      if (value === undefined) {
        return res.status(400).json({ error: 'القيمة مطلوبة' });
      }
      await redis.set(PREFIX + key, value);
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error('state API error:', err);
    return res.status(500).json({ error: 'خطأ في السيرفر' });
  }
}
