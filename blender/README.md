# Jalur Blender

Skrip di folder ini membangun aset dan render dengan Blender (Cycles, path tracing) lewat Python.

```bash
python -m venv .venv && . .venv/bin/activate
pip install bpy numpy          # Blender sebagai modul Python (sekitar 370 MB)
python blender/volt_car.py render     # keluaran: blender/out/volt_render.jpg
python blender/volt_car.py glb        # keluaran: blender/out/volt_car.glb
```

Atau lewat Blender biasa: `blender -b -P blender/volt_car.py -- render`.

`volt_car.py` membangun SUV listrik VOLT X1. Proporsinya diturunkan dari pengukuran model SUV besar sebagai acuan
(profil atap, lebar per ketinggian, posisi roda), lalu sengaja dibuat berbeda: hidung tertutup dengan bar cahaya tanpa
gril, atap meluncur ke belakang, garis pinggang naik ke belakang, atap kaca, dan rel atap tipis. Detailnya: celah panel
pintu, gagang rata, spion, trim lengkung roda, cladding samping, lampu DRL dan lampu belakang penuh, plat, interior,
ban bertapak, dua model velg (Aero dan Sport), cakram rem, dan kaliper. Diekspor ke `assets/models/volt_car.glb` dan
dimuat oleh `js/concepts/volt.js`, yang mengganti bahan berdasarkan nama (Cat, Kaca, Velg, dan seterusnya).

```bash
python blender/volt_car.py render --fast   # pratinjau cepat, sekitar 40 detik
python blender/volt_car.py glb             # ekspor GLB
cp blender/out/volt_car.glb assets/models/volt_car.glb
```

## Ikan badut AQUARIA

`aqua_clownfish.py` membangun ikan badut (Amphiprion ocellaris): badan loft dari profil punggung, perut, dan lebar
(moncong tumpul, pangkal ekor ramping), sirip punggung berduri dan lunak, sirip dubur, perut, dada, dan ekor dengan
jari-jari sirip, serta mata dengan iris. Tekstur belang (tiga pita putih bertepi hitam, pita tengah menonjol ke depan)
dan tepi hitam sirip dibuat di skrip dengan numpy, tanpa berkas luar. Dimuat oleh `js/concepts/aqua.js` (`clownFish`)
untuk ikan badut di adegan bawah laut dan model produk; ekor (`Ekor`) dan sirip dada (`SiripDada_L/R`) dianimasikan di Three.js.

```bash
blender -b -P blender/aqua_clownfish.py     # keluaran: blender/out/clownfish.glb (sekitar 320 KB)
cp blender/out/clownfish.glb assets/models/clownfish.glb
```

## Sepatu KAZE

`kaze_sneaker.py` membangun Air Kaze 02 dari satu jejak kaki dan satu fungsi permukaan upper: outsole dan midsole
dengan toe spring, alur, dan tapak; upper dengan bukaan kerah elips; overlay yang menempel mengikuti normal permukaan
(toe cap, heel counter melengkung, garis angin); eyestay, mata tali, tali bersilang dengan simpul, lidah, bantalan kerah,
dan tab tumit. Bahan bernama (Upper, Aksen, Sol, Midsole, Tali, Logam, Dalam) diganti di `buildShoe` (`js/concepts/kaze.js`)
dengan bahan colorway yang sama, jadi tombol colorway tetap bekerja. Sekitar 27 ribu segitiga.

## Alat seduh KAWAH KOPI

`kopi_alat_seduh.py` membangun set V60 (dripper keramik dengan 12 rusuk spiral, satu lubang besar, pegangan;
kertas saring berlipat; server kaca bertebal dengan cerat, pegangan, dan kopi) dan ketel leher angsa (badan baja, tutup
kubah dan kenop, cerat meruncing, pegangan hitam dengan braket). Dipakai oleh `js/world/kopi.js` untuk rak, pajangan 360°,
dan gambar katalog; warna keramik mengikuti varian (Hitam arang, Putih, Terakota).

```bash
blender -b -P blender/kaze_sneaker.py       # blender/out/sneaker.glb
blender -b -P blender/kopi_alat_seduh.py    # blender/out/v60_set.glb, blender/out/gooseneck.glb
cp blender/out/{sneaker,v60_set,gooseneck}.glb assets/models/
```

## Status

Mobil sudah terbaca sebagai mobil dan detailnya lebih kaya daripada versi loft sebelumnya, tetapi proporsinya masih
bergaya retro dan permukaannya belum sepresisi model studio. Untuk hasil setingkat foto, ganti bodi dengan model
berkualitas dan pertahankan skrip ini untuk pencahayaan, material, dan ekspor.
