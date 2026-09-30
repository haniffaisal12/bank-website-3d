# Jalur Blender

Skrip di folder ini membangun aset dan render dengan Blender (Cycles, path tracing) lewat Python.

```bash
python -m venv .venv && . .venv/bin/activate
pip install bpy numpy          # Blender sebagai modul Python (sekitar 370 MB)
python blender/volt_car.py render     # keluaran: blender/out/volt_render.jpg
python blender/volt_car.py glb        # keluaran: blender/out/volt_car.glb
```

Atau lewat Blender biasa: `blender -b -P blender/volt_car.py -- render`.

`volt_car.py` membangun mobil VOLT E-1 dengan detail setingkat aset referensi (lihat `STUDI_CHANDELIER.md`):
bodi di-loft dari penampang superellipse dengan kaca yang mengikuti garis jendela, lubang roda hasil boolean, celah panel
yang diproyeksikan ke permukaan, gagang pintu, spion, lampu DRL dan lampu belakang, ban bertapak, dua model velg
(Aero dan Sport), cakram rem, kaliper, dan interior sederhana. Hasilnya diekspor ke `assets/models/volt_car.glb`
dan dimuat oleh `js/concepts/volt.js`, yang mengganti bahan berdasarkan nama (Cat, Kaca, Velg, dan seterusnya).

```bash
python blender/volt_car.py render --fast   # pratinjau cepat, sekitar 40 detik
python blender/volt_car.py glb             # ekspor GLB
cp blender/out/volt_car.glb assets/models/volt_car.glb
```

Render 1600x900 dengan 128 sampel dan denoiser OpenImageDenoise butuh beberapa menit di 4 inti CPU.

## Status

Mobil sudah terbaca sebagai mobil dan detailnya lebih kaya daripada versi loft sebelumnya, tetapi proporsinya masih
bergaya retro dan permukaannya belum sepresisi model studio. Untuk hasil setingkat foto, ganti bodi dengan model
berkualitas dan pertahankan skrip ini untuk pencahayaan, material, dan ekspor.
