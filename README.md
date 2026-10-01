# Bank Website 3D

Bank inspirasi website 3D sinematik untuk **company profile** dan **e-commerce**. Setiap konsep punya halamannya sendiri: kamera bergerak dari luar hingga masuk ke interior, dikendalikan oleh snap-scroll, dengan tombol melayang yang mengubah adegan.

## Konsep

| Halaman | Jenis | Ringkasan |
|---|---|---|
| `concepts/nexus.html` | Company profile | Menara kaca ke server room dengan hologram |
| `concepts/aqua.html` | E-commerce | Gerbang dermaga ke bawah air, beri makan ikan |
| `concepts/serena.html` | Company profile | Resort tropis dari bird-eye ke kamar, siang/malam |
| `concepts/flora.html` | E-commerce | Rumah kaca botani, siram dan lampu tumbuh |
| `concepts/kaze.html` | E-commerce | Gang neon berhujan ke butik sneaker |
| `concepts/celeste.html` | E-commerce / profil | Observatorium gunung, teleskop dan planet |
| `concepts/volt.html` | E-commerce | Showroom SUV listrik dengan konfigurator |
| `concepts/genom.html` | Company profile | Klinik genomik: menyelam dari sel ke heliks DNA |
| `concepts/kopi.html` | E-commerce | Kedai kopi vulkanik: kawah, kebun, roastery, seduh |

`index.html` adalah beranda: portal 3D ke semua konsep dan daftar ide yang belum dibangun.

## Studi kasus dan interaksi

- **Studi kasus:** slide terakhir tiap konsep (atau tombol *Studi kasus* di kanan atas) berisi klien fiktif, tantangan, pendekatan, keputusan desain
  (dengan tombol *Lihat di adegan*), target hipotesis, dan stack. Datanya ada di `js/study.js`. Semua klien dan angka fiktif,
  dan angka hanyalah target, bukan hasil terukur.
- **Titik panas:** lingkaran berdenyut di dalam adegan. Klik untuk membuka penjelasan keputusan desain di tempat itu.
- **Klik objek 3D:** ikan, sepatu, mobil, tanaman, hologram, planet, dan lainnya dapat diklik. Kursor berubah dan muncul petunjuk.
- **Suara:** semua dihasilkan dengan Web Audio (tanpa berkas suara). Ambien berganti per slide, klik dan aksi punya efek sendiri.
  Browser baru mengizinkan suara setelah klik pertama. Tombol *Suara* di kanan atas mematikannya dan pilihan diingat.
- **Gerak:** kursor khusus dan riak klik, bilah progres, teks muncul bertahap, dorongan FOV dan getar kamera pada aksi, getar ponsel saat menekan tombol.

## Situs lengkap (compro dan e-commerce)

Selain pengalaman 3D, tiap konsep punya **situs sungguhan** di `sites/<id>.html` (tombol *Buka situs* di HUD 3D, dan *Jelajah 3D* di situsnya):

| Jenis | Konsep | Halaman |
|---|---|---|
| E-commerce | AQUARIA, FLORA, KAZE, CELESTE, VOLT, KAWAH KOPI | beranda, katalog + filter/urut/cari, detail produk (varian, harga dinamis, galeri), keranjang (kupon, ongkir gratis), checkout (validasi, pengiriman, pembayaran), konfirmasi, lacak pesanan, cerita, FAQ, kontak |
| Company profile | NEXUS·AI, SERENA, HELIX | beranda, tentang, layanan + detail, proyek/studi kasus + detail, wawasan (artikel), karier, FAQ, kontak |

- Router berbasis hash (`#/produk/...`), satu berkas data per situs di `js/sites/<id>.js` (isi, produk, harga, kupon, ongkir), template di `js/site/shop.js` dan `js/site/compro.js`, kerangka di `js/site/app.js`, gaya di `css/shop.css`.
- **Keranjang menyatu dengan 3D:** tombol *Tambah ke keranjang* di adegan 3D memasukkan produk yang sama ke keranjang situs (`js/site/store.js`).
- **Semua simulasi:** keranjang, pesanan, dan pesan kontak disimpan di `localStorage` peramban; tidak ada pembayaran atau pengiriman nyata. Merek, klien, harga, dan angka fiktif.
  Untuk memakai backend sungguhan, ganti isi objek `api` di `js/site/store.js` (bentuk argumen dan hasil sudah sama).
- **Gambar** situs adalah tangkapan dari adegan 3D (`assets/img/<id>/NN.jpg`). Buat ulang dengan `node tools/capture.js [id ...]` (butuh Playwright dan server lokal di port 8765, atau set `BASE`). Mode `?bare=1` pada halaman konsep menyembunyikan semua UI untuk keperluan ini.

## Menjalankan lokal

Situs ini statis. Cukup sajikan foldernya lewat server HTTP apa pun:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

Membuka `index.html` langsung dari `file://` tidak berfungsi karena memakai ES module dan `fetch`.
Three.js dimuat dari CDN (jsDelivr, versi 0.163.0), jadi perlu koneksi internet.

Parameter `?q=0|1|2` memaksa kualitas grafis (hemat, sedang, tinggi). Tanpa parameter, kualitas dipilih otomatis dan turun sendiri bila perangkat berat. Layar sempit dan layar sentuh mulai dari kualitas sedang.

## Struktur

```
index.html            beranda
concepts/*.html       satu halaman 3D per konsep
sites/*.html          situs compro / e-commerce per konsep
css/site.css          gaya bersama, responsif dari 320px sampai desktop
js/core.js            helper 3D, tekstur prosedural, HDRI, bahan
js/engine.js          slide snap-scroll, HUD, kamera dari posisi scroll, post-processing
js/audio.js           suara prosedural (Web Audio)
js/study.js           studi kasus, titik panas, dan pemetaan audio per konsep
js/registry.js        daftar konsep (menu, kartu, tautan antar-halaman)
js/concepts/*.js      satu modul per konsep: adegan, slide, dan aksi tombol
js/cover.js           adegan portal untuk beranda
js/site/              kerangka situs: app (router), shop, compro, store, ui
js/sites/*.js         data tiap situs (teks, produk, harga)
css/shop.css          gaya situs
tools/capture.js      tangkap gambar situs dari adegan 3D
assets/img/           gambar hasil tangkapan
assets/hdri/          HDRI Poly Haven (CC0) untuk pencahayaan
assets/models/        model glTF (Chandelier_03 di kamar SERENA)
blender/              skrip Blender (bpy) untuk render dan ekspor aset; lihat blender/README.md
```

## Menambah konsep

1. Salin salah satu `js/concepts/*.js`, ganti `build...` dan objek `concept` (slide, kamera, tombol).
2. Tambahkan entri di `js/registry.js`.
3. Salin salah satu `concepts/*.html` dan ganti nama modul yang diimpor.

## Lisensi dan atribusi

Kode: MIT. HDRI dari [Poly Haven](https://polyhaven.com) (CC0) lewat paket `@pmndrs/assets`. Three.js: MIT.
