# Jalur Blender

Skrip di folder ini membangun aset dan render dengan Blender (Cycles, path tracing) lewat Python.

```bash
python -m venv .venv && . .venv/bin/activate
pip install bpy numpy          # Blender sebagai modul Python (sekitar 370 MB)
python blender/volt_car.py render     # keluaran: blender/out/volt_render.jpg
python blender/volt_car.py glb        # keluaran: blender/out/volt_car.glb
```

Atau lewat Blender biasa: `blender -b -P blender/volt_car.py -- render`.

`volt_car.py` membangun bodi VOLT E-1 dari penampang yang di-loft, memberi cat clearcoat, kaca, roda, dan lampu, lalu
merender di studio dengan HDRI dari `assets/hdri/studio.exr`. Render 1280x720 dengan 96 sampel dan denoiser
OpenImageDenoise butuh sekitar 2 menit di 4 inti CPU.

## Status

Ini baru jalur kerjanya. Pencahayaan dan pantulan path tracing terlihat nyata, tetapi bentuk mobil hasil skrip masih
kasar (proporsi, lengkung, dan velg belum meyakinkan), jadi GLB-nya belum dipakai di situs. Untuk hasil yang benar-benar
fotorealistis, ganti bodi dengan model 3D berkualitas (misalnya file `.glb` berlisensi bebas atau buatan sendiri),
lalu pakai skrip ini untuk pencahayaan, material, render poster, dan ekspor.
