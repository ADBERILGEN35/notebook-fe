# Notebook Frontend

Node.js (Vite + React + TypeScript) tabanlı yönetim paneli arayüzü. Backend `notebook` projesindeki JWT, not, notebook, etiket ve kullanıcı servisleriyle konuşacak şekilde yapılandırılmıştır.

## Başlangıç

```bash
cd frontend
npm install        # veya pnpm / yarn
npm run dev
```

Varsayılan olarak API tabanı `http://localhost:8080/api` kabul edilir. Farklı ortamlar için `.env` dosyasında `VITE_API_BASE_URL` değeri tanımlayabilirsiniz.

## Komutlar

- `npm run dev` – Vite geliştirme sunucusu
- `npm run build` – Üretim derlemesi
- `npm run preview` – Üretim çıktısını lokal ön izleme
- `npm run lint` – ESLint kontrolleri
- `npm run format` – Prettier ile formatlama

## Yapı

- `src/components` – Layout ve ortak bileşenler
- `src/pages` – Router üzerinden erişilen ekranlar
- `src/sections` – Tekrar kullanılabilir sayfa blokları
- `src/lib` – API istemcisi ve yardımcılar
- `src/styles` – Global ve bileşen bazlı stiller

Tasarım bileşenleri ve gerçek API entegrasyonları ilerleyen adımlarda eklenecek.

