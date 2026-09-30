# Studi aset: Chandelier_03 (1k)

Dibaca langsung dari file `.blend` dengan `blender/study_chandelier.py`. Berkas tekstur (`textures/*.jpg|exr|png`)
tidak ikut terunggah, jadi bahan dibuat ulang (kuningan, kaca) dan hanya geometrinya yang dipelajari.

## Yang terbaca dari geometri

| Aspek | Nilai |
|---|---|
| Ukuran | 0,78 m x 0,78 m x 1,04 m, gantung ke bawah dari titik nol |
| Vertex / segitiga | 15.676 / 29.301 (semua segitiga, tanpa quad) |
| Bagian terpisah | 102, dengan banyak salinan identik: 18 lilin, 18 cawan kaca, 18 pegangan, 6 tiang, 36 sambungan kecil |
| Bahan | 3 slot: logam, bohlam, kaca. Kaca hanya 4.480 segitiga (15%) |
| Sisi | median 6,5 mm, terkecil 0,37 mm; 10.691 dari 44.922 sisi bersudut lebih dari 35 derajat |
| Normal | custom normals + sisi ditandai `sharp_edge`, seluruh permukaan smooth-shaded |
| UV | satu lapisan `UVMap`, dipakai untuk diff, metallic, roughness, normal, dan opacity |

## Pelajaran untuk konsep lain

1. **Detail ada di siluet, bukan di tekstur.** Lengkung daun akantus pada lengan dipahat sebagai geometri tak beraturan,
   bukan silinder mulus. Itu yang membuat objek tidak terlihat seperti primitif.
2. **Susun dari bagian yang diulang.** 18 salinan lilin dan cawan, satu bentuk dipahat sekali. Cocok dengan cara
   `InstancedMesh` bekerja di Three.js.
3. **Normal kustom + sisi tajam yang ditandai.** Permukaan tetap halus, tetapi tepi logam menangkap kilau. Model buatan
   skrip di repo ini belum punya ini dan itu terlihat jelas pada bodi mobil VOLT.
4. **Kaca dipisah jadi bahan tersendiri** dengan bentuk berfaset, sehingga pantulan pecah menjadi banyak sorot.
5. **Satu set tekstur PBR 1k** (diffuse, metallic, roughness, normal GL, opacity) sudah cukup untuk tampil nyata bila
   geometrinya baik.

## Pemakaian di situs

`assets/models/chandelier_03.glb` (600 KB, tanpa UV dan tekstur) dipasang di kamar SERENA. Bahan diganti di Three.js:
kuningan `MeshPhysicalMaterial` dan kaca transparan. Posisi ujung 18 lilin diekspor ke `chandelier_03.json`, dipakai
untuk cahaya api pada mode malam.

Lisensi: nama berkasnya mengikuti aset Poly Haven (CC0). Mohon konfirmasi sumber aslinya sebelum dipakai komersial.
