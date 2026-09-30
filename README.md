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

`index.html` adalah beranda: portal 3D ke semua konsep dan daftar ide yang belum dibangun.

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
concepts/*.html       satu halaman per konsep
css/site.css          gaya bersama, responsif dari 320px sampai desktop
js/core.js            helper 3D, tekstur prosedural, HDRI, bahan
js/engine.js          slide snap-scroll, HUD, kamera dari posisi scroll, post-processing
js/registry.js        daftar konsep (menu, kartu, tautan antar-halaman)
js/concepts/*.js      satu modul per konsep: adegan, slide, dan aksi tombol
js/cover.js           adegan portal untuk beranda
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
