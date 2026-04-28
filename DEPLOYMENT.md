# Panduan Publikasi Profesional LAZISNU Ngaglik

Dokumen ini berisi langkah-langkah teknis untuk memindahkan aplikasi ini dari lingkungan pengembangan (AI Studio) ke server produksi asli Anda sendiri.

## Langkah 1: Pembelian Domain (Tugas Anda)
Beli domain resmi (contoh: `lazisnungaglik.org` atau `upzisnungaglik.id`).
*   **Rekomendasi:** Niagahoster, Rumahweb, atau Cloudflare.
*   **Penting:** Pastikan Anda memiliki akses ke panel DNS domain tersebut.

## Langkah 2: Persiapan Lingkungan Lokal
Anda perlu memindahkan kode ini ke komputer Anda sendiri:
1.  Unduh kode project ini (Gunakan menu **Export** atau **Download ZIP** di AI Studio).
2.  Instal **Node.js** (versi 18 ke atas) di komputer Anda.
3.  Instal Firebase CLI dengan perintah: `npm install -g firebase-tools`.

## Langkah 3: Deployment ke Firebase Hosting
Firebase Hosting adalah pilihan terbaik karena database Anda sudah ada di sana.
1.  Buka terminal di folder project Anda.
2.  Jalankan `firebase login`.
3.  Jalankan `firebase init`.
    *   Pilih **Hosting**.
    *   Pilih **Use an existing project**.
    *   Pilih project Firebase yang sudah kita buat (lihat di `firebase-applet-config.json`).
    *   Tentukan folder publik: `dist`.
    *   Konfigurasi sebagai single-page app: `Yes`.
4.  Jalankan perintah build: `npm run build`.
5.  Jalankan perintah deploy: `firebase deploy`.

## Langkah 4: Menghubungkan Domain
1.  Buka [Firebase Console](https://console.firebase.google.com/).
2.  Masuk ke menu **Hosting** -> **Add Custom Domain**.
3.  Masukkan nama domain yang Anda beli.
4.  Ikuti instruksi untuk menambahkan **A Record** atau **TXT Record** di panel DNS domain Anda.
5.  Tunggu proses verifikasi (biasanya 1-24 jam).

## Langkah 5: Pengaturan Keamanan Akhir
1.  Pastikan **Firebase Authentication** sudah mengizinkan domain baru Anda di bagian "Authorized Domains".
2.  Update **Firestore Rules** ke versi final (Gunakan file `firestore.rules` yang sudah kita buat).

---
**Butuh bantuan lebih lanjut?**
Anda bisa menanyakan detail teknis dari setiap langkah di atas kepada saya.
