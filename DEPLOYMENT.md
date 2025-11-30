# دليل نشر المنصة

## الطريقة الأسهل: Vercel (موصى به)

Vercel هو أفضل منصة لنشر تطبيقات Next.js - مجاني وسهل!

### الخطوات:

1. **إنشاء حساب على Vercel**
   - اذهب إلى: https://vercel.com
   - سجل حساب جديد (يمكنك استخدام GitHub)

2. **رفع المشروع على GitHub**
   - أنشئ مستودع جديد على GitHub
   - ارفع جميع ملفات المشروع

3. **ربط المشروع مع Vercel**
   - في Vercel، اضغط "Add New Project"
   - اختر المستودع من GitHub
   - Vercel سيكتشف تلقائياً أنه Next.js
   - اضغط "Deploy"

4. **الوصول للمنصة**
   - بعد النشر (دقيقتين تقريباً)، ستحصل على رابط مثل:
     `https://your-project-name.vercel.app`
   - افتح الرابط من هاتفك!

---

## طريقة بديلة: Netlify

1. اذهب إلى: https://netlify.com
2. سجل حساب جديد
3. اضغط "Add new site" → "Import an existing project"
4. اختر GitHub واختر المستودع
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. اضغط "Deploy site"

---

## طريقة بديلة: Railway

1. اذهب إلى: https://railway.app
2. سجل حساب جديد
3. اضغط "New Project" → "Deploy from GitHub repo"
4. اختر المستودع
5. Railway سيكتشف تلقائياً الإعدادات
6. بعد النشر، ستحصل على رابط

---

## النشر المحلي (للاختبار)

إذا أردت تشغيل المنصة على شبكتك المحلية:

```bash
# بناء المشروع
npm run build

# تشغيله
npm start
```

ثم افتح من هاتفك:
- على iOS: `http://[IP-Address]:3000`
- على Android: `http://[IP-Address]:3000`

للعثور على IP Address:
- Mac/Linux: `ifconfig | grep "inet "`
- Windows: `ipconfig`

---

## ملاحظات مهمة:

1. **البيانات**: حالياً البيانات محفوظة في `localStorage` في المتصفح
   - كل مستخدم سيرى بياناته فقط
   - البيانات لن تنتقل بين الأجهزة

2. **لحفظ البيانات على السيرفر** (لاحقاً):
   - ستحتاج قاعدة بيانات (MongoDB, PostgreSQL, إلخ)
   - ستحتاج API routes في Next.js

3. **HTTPS**: Vercel و Netlify يوفران HTTPS تلقائياً

---

## بعد النشر:

✅ افتح الرابط من هاتفك
✅ جرب جميع الميزات
✅ شارك الرابط مع الآخرين

---

## الدعم:

إذا واجهت أي مشاكل، تأكد من:
- أن جميع الملفات مرفوعة على GitHub
- أن `package.json` موجود
- أن `next.config.ts` موجود

