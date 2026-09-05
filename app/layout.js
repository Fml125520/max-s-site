import './globals.css';

export const metadata = {
  title: 'ماكسز — اطلب أونلاين',
  description: 'فرايد تشيكن، سندوتشات، وجبات عائلية، وعروض يومية. توصيل سريع لدسوق وكفر الشيخ.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
