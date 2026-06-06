<div align="center">
  <div class="tenor-gif-embed" data-postid="1390165288419760505" data-share-method="host" data-aspect-ratio="1.79137" data-width="100%">
    <a href="https://tenor.com/view/kurumi-gif-1390165288419760505">Kurumi GIF</a> from <a href="https://tenor.com/search/kurumi-gifs">Kurumi GIFs</a>
  </div>
  <script type="text/javascript" async src="https://tenor.com/embed.js"></script>
</div>

# KurumiBOT

KurumiBOT adalah WhatsApp bot modern berbasis `baileys-pro` yang mendukung berbagai fitur utilitas dan media.

## ✨ Fitur Utama

Plugin yang tersedia di `plugins/`:

- `backupdb` / `backup`
  - Backup database dan kirim file ZIP.
- `getowner` / `owner` / `creator`
  - Menampilkan kontak owner bot dalam bentuk vCard.
- `menu` / `iyam`
  - Menampilkan daftar perintah bot, statistik pengguna, dan status runtime.
- `ping`
  - Mengecek respon bot.
- `runtime` / `iyamuptime`
  - Menampilkan lama bot aktif.
- `sticker` / `s`
  - Mengubah gambar atau video menjadi stiker.
- `toimg` / `toimage`
  - Mengubah stiker statis menjadi gambar.
- `topdf` / `finishpdf`
  - Mengubah satu atau banyak gambar menjadi PDF.
- `viewonce` / `rvo`
  - Membaca ulang pesan view-once dan mengirim ulang media.

## ⚙️ Persyaratan

- Node.js 18+ (direkomendasikan)
- NPM
- Koneksi internet untuk WhatsApp dan dependensi

## 🚀 Cara Install

### 1. Clone atau Unduh

```bash
git clone https://github.com/ilmanhdyt/KurumiBOT.git
cd KurumiBOT
```

### 2. Install Dependensi

```bash
npm install
```

> Jika `sharp` gagal terpasang, coba:
>
> ```bash
> npm install sharp --verbose
> ```

### 3. Konfigurasi Dasar

Edit `config.js` untuk menyesuaikan:

- `owner`: nomor owner (tanpa `+` atau spasi)
- `botName`: nama bot
- `ownerName`: nama pemilik
- `prefix`: prefix perintah bot
- `modeBot`: `self` atau `public`

Pastikan juga `assets/thumb.jpg` tersedia jika ingin menggunakan thumbnail menu.

### 4. Menjalankan Bot

```bash
npm start
```

Atau:

```bash
node index.js
```


## 💻 Install di Berbagai Platform

### Windows

1. Install Node.js dari https://nodejs.org/
2. Buka PowerShell/CMD
3. Jalankan `npm install`
4. Jalankan `npm start`

### Linux

1. Install Node.js via package manager (misal `sudo apt install nodejs npm` atau `nvm`)
2. Jalankan `npm install`
3. Jalankan `npm start`

### Termux

1. Install paket dasar:

```bash
pkg update && pkg upgrade
pkg install nodejs git ffmpeg
```

2. Clone bot dan install:

```bash
git clone https://github.com/ilmanhdyt/KurumiBOT.git
cd KurumiBOT
npm install
npm start
```

### Replit / Cloud VPS

1. Upload atau clone repository
2. Jalankan `npm install`
3. Jalankan `npm start`

> Pastikan environment mendukung `sharp` dan `ffmpeg`.

## 📌 Daftar Perintah Singkat

Gunakan prefix `.` di depan perintah.

- `.ping`
- `.owner` atau `.creator`
- `.iyam`
- `.iyamruntime` atau `.iyamuptime`
- `.sticker` / `.s`
- `.toimg`
- `.topdf`
- `.finishpdf`
- `.rvo`
- `.backupdb`

## 🧩 Struktur Proyek

- `index.js` - titik masuk bot
- `config.js` - konfigurasi bot
- `plugins/` - logic perintah bot
- `lib/` - helper dan utilitas
- `database/` - data pengguna dan grup
- `session/` - sesi WhatsApp

## 🛠️ Catatan Tambahan

- Sesuaikan file `config.js` dengan nomor owner dan nama bot.
- Pastikan jalur file thumbnail di `config.js` benar.
- Jika bot berjalan dalam mode `self`, hanya owner yang bisa menggunakan perintah.

---

## 👨‍💻 Developer

<h3 align="center">Made by:</h3>
<p align="center">
  <a href="https://github.com/ilmanhdyt"><img src="https://github.com/ilmanhdyt.png?size=128" height="128" width="128" /></a>
</p>

---
