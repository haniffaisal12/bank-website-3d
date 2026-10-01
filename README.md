# Bank Website 3D

Bank inspirasi website 3D untuk **company profile** dan **e-commerce**. Setiap konsep adalah **situs sungguhan yang hidup di dalam adegan 3D-nya sendiri**:
halaman menjadi tempat, kamera terbang dari satu tempat ke tempat lain, pengunjung bisa melihat sekeliling 360°, dan produk (atau vila, inti hologram, segmen DNA) bisa dikitari 360°.

## Sembilan situs

| Halaman | Jenis | Tempat di adegan |
|---|---|---|
| `concepts/kopi.html` | E-commerce · kopi | kawah (beranda), kebun (cerita), ruang sangrai, meja seduh, rak roastery (katalog), pajangan 360°, kasir |
| `concepts/aqua.html` | E-commerce · akuarium | gerbang dermaga, etalase bawah laut (beri makan ikan, voucher), rak karang, pajangan batu 360°, kios kasir di dermaga |
| `concepts/flora.html` | E-commerce · tanaman | bukit, jalan setapak, lapak tanaman, bedeng (siram, lampu tumbuh), pajangan 360°, meja kasir |
| `concepts/kaze.html` | E-commerce · sneaker | gang hujan (palet neon), tiga pedestal (colorway), meja drop, pedestal 360°, kasir |
| `concepts/celeste.html` | E-commerce · teleskop | puncak, kubah (buka celah, arahkan teleskop, tiket pengamatan), rak teleskop, pajangan 360°, kasir |
| `concepts/volt.html` | E-commerce · otomotif | plaza, aula konfigurator (cat, velg, lampu), VOLT X1 dikitari 360° di piringan, dinding aksesori, meja konsultan |
| `concepts/nexus.html` | Company profile · AI | plaza, lobi (tentang), kios layanan, lorong server (proyek), inti hologram 360°, media wall (wawasan), karier, resepsionis |
| `concepts/serena.html` | Company profile + reservasi · resor | udara, pantai, kolam & spa (pengalaman), vila dikitari 360°, kamar (siang/malam), dek reservasi dengan penanda vila |
| `concepts/genom.html` | Company profile + janji temu · klinik | sel, membran, inti (layanan), segmen DNA 360°, Golgi (studi), mitokondria (wawasan), jadwal konsultasi |

`index.html` adalah beranda: portal 3D ke semua konsep. Alamat lama `sites/<id>.html` dialihkan ke halaman di atas.

## Cara kerja situs 3D

- **Setiap halaman adalah tempat.** Pindah halaman membuat kamera terbang ke tempatnya (melewati pintu, menyelam, menembus kaca).
  Router berbasis hash: tombol kembali/maju browser dan tautan langsung (misalnya `concepts/kopi.html#/produk/v60-set`) bekerja.
- **Tur 360°:** seret layar untuk melihat sekeliling dari tempat mana pun; klik pin untuk pindah; gulir, tombol ‹ ›, atau PageUp/PageDown untuk tur berurutan.
- **Produk 360°:** di halaman produk kamera mengitari model 3D-nya; seret untuk memutar, gulir atau cubit untuk mendekat. Varian langsung mengubah model
  (label sangrai dan berat kemasan kopi, warna dripper, ukuran akuarium, colorway sepatu, warna cat dan velg mobil, dan lainnya).
  Gambar katalog dan keranjang adalah render dari model yang sama.
- **Dunia ikut berubah:** isi keranjang muncul di keranjang di meja kasir; reservasi menyalakan penanda di atas vila; pilihan layanan menyalakan segmen DNA; konfigurator mengecat mobil.
- **Halaman lengkap:** e-commerce punya katalog dengan filter, detail produk (varian dan harga dinamis), keranjang dengan kupon dan ongkir gratis, checkout tervalidasi,
  konfirmasi dengan nomor pesanan, lacak pesanan, kontak dan FAQ. Company profile punya tentang, layanan dan detailnya, proyek/studi kasus, wawasan, karier, kontak, dan reservasi/janji temu.
- **Semua simulasi:** keranjang, pesanan, reservasi, dan pesan disimpan di `localStorage` peramban; tidak ada pembayaran nyata. Merek, klien, harga, dan angka fiktif.
  Untuk backend sungguhan, ganti isi objek `api` di `js/site/store.js` (bentuk argumen dan hasil sudah sama).
- Konten panel adalah DOM biasa (bisa difokus, dibaca pembaca layar). Di desktop panel ada di kanan dan adegan digeser ke kiri; di ponsel panel menjadi lembar bawah dan bisa diciutkan.
- Suara prosedural (Web Audio) berganti per tempat; aktif setelah klik pertama, tombol ♪ untuk mematikan.

## Menjalankan lokal

Situs ini statis. Cukup sajikan foldernya lewat server HTTP apa pun:

```bash
python3 -m http.server 8000
# buka http://localhost:8000
```

Membuka `index.html` langsung dari `file://` tidak berfungsi karena memakai ES module dan `fetch`.
Three.js dimuat dari CDN (jsDelivr, versi 0.163.0), jadi perlu koneksi internet.

Parameter `?q=0|1|2` memaksa kualitas grafis (hemat, sedang, tinggi), `?instant=1` mematikan animasi terbang (untuk pengujian), `?bare=1` menyembunyikan UI. Tanpa parameter, kualitas dipilih otomatis dan turun sendiri bila perangkat berat. Layar sempit dan layar sentuh mulai dari kualitas sedang.

## Struktur

```
index.html            beranda (portal 3D)
concepts/*.html       sembilan situs 3D
sites/*.html          pengalihan dari alamat lama
css/world.css         gaya situs 3D (panel, pin, bilah atas), responsif
css/site.css          gaya beranda
js/core.js            helper 3D, tekstur prosedural, HDRI, bahan
js/world/world.js     mesin situs 3D: stasiun, terbang, lihat 360°, orbit produk, pin, router, pasca-proses
js/world/kit.js       perabot bersama: rak, pajangan berputar, meja kasir, layar kanvas, gambar katalog dari model
js/world/shop.js      panel e-commerce (katalog, produk, keranjang, checkout, pesanan, lacak, kontak)
js/world/compro.js    panel company profile (tentang, layanan, proyek, wawasan, karier, reservasi)
js/world/<id>.js      satu per situs: tempat, perabot, model produk, panel cerita
js/concepts/*.js      adegan 3D tiap konsep (dipakai ulang oleh situs)
js/sites/*.js         data tiap situs (teks, produk, harga, kupon, ongkir)
js/site/store.js      keranjang, pesanan, api simulasi (localStorage)
js/site/ui.js         utilitas DOM dan validasi formulir
js/engine.js          slide snap-scroll untuk beranda
js/audio.js           suara prosedural (Web Audio)
tools/capture.js      tangkap gambar tiap tempat (cadangan tanpa WebGL)
assets/img/           gambar hasil tangkapan
assets/hdri/          HDRI Poly Haven (CC0) untuk pencahayaan
assets/models/        model glTF (lampu gantung SERENA, mobil VOLT)
blender/              skrip Blender (bpy) untuk aset; lihat blender/README.md
```

## Menambah situs

1. Buat adegan di `js/concepts/<id>.js` (fungsi build yang mengembalikan `scene`, `update`, `actions`).
2. Tulis data di `js/sites/<id>.js` (merek, tema, produk atau layanan).
3. Tulis `js/world/<id>.js`: daftar stasiun (posisi kamera, induk untuk jalur terbang), perabot dari `kit.js`, model produk, dan `route()` yang memetakan alamat ke tempat dan panel.
4. Salin salah satu `concepts/*.html` dan ganti id-nya; tambahkan entri di `js/registry.js`.

## Lisensi dan atribusi

Kode: MIT. HDRI dari [Poly Haven](https://polyhaven.com) (CC0) lewat paket `@pmndrs/assets`. Three.js: MIT.
