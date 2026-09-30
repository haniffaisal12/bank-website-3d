# Studi aset referensi tambahan

Empat aset milik pengguna dibaca dengan `bpy` (dan pembaca `.3ds` buatan sendiri di `tools_3ds.py`). Berkas sumbernya tidak
disimpan di repo. Konversi ke GLB ringan dilakukan oleh `convert_refs.py`.

| Aset | Isi | Yang dipelajari |
|---|---|---|
| **Telescope.blend** | 9 objek, 31.550 vertex. Tabung teleskop dengan dua tabung pencari, dudukan, tiga kaki tripod, empat baut | Hierarki nyata (tabung anak dari dudukan, titik putar di asal objek) sehingga bisa dibidik tanpa mengubah geometri. Modifier Subsurf dan Solidify menghasilkan tepi membulat. Bahan logam murni (metallic 1, roughness 0,1 sampai 0,3) |
| **shoe.obj** | Sepasang sepatu dalam satu mesh, 75.644 segitiga, 28 bagian terpisah, 2 bahan (hitam dan merah muda untuk tali) | Detail ada di sambungan lapisan: sol dua tingkat, panel samping, kerah berlapis, mata tali, tali sebagai geometri terpisah |
| **Tree1.3ds** | Pohon ginkgo. 8.967 daun berupa kipas 5 segitiga dan cabang 38.185 segitiga, dengan empat tingkat bahan kulit kayu | Daun adalah geometri, bukan kartu ber-alfa, jadi siluetnya benar dari semua sudut. Cabang bertingkat (Level 1 sampai 3) |
| **MercedesBenzGLS580.fbx** | 1 mesh, 332.922 vertex, 361.236 segitiga, 23 bahan (cat, kaca lampu, kaca gelap, ban, interior, gril, kolong, garis tepi) | Kaya detail: velg berjari banyak, gril dan lampu berlapis, wiper, rel atap, spion dengan lampu sein, interior lengkap. Terlalu berat untuk web tanpa dekimasi besar |

## Konversi untuk web

- Teleskop: subsurf tingkat 1 hanya pada tabung dan dudukan, baut didekimasi. Sekitar 3 MB.
- Sepatu: hanya sepatu kiri. Dua versi, tinggi (22.672 segitiga) untuk pedestal dan rendah (2.644) untuk rak.
  Bahan dipisah menjadi `Upper`, `Sole` (20% bagian bawah), dan `Accent` (tali) agar colorway bisa diganti di Three.js.
- Pohon: dua versi. Tinggi (31.538 segitiga) dengan 42% daun diperbesar 1,45 kali, rendah (6.110) dengan 13% daun
  diperbesar 2,4 kali dan cabang didekimasi. Pohon rendah dipasang dengan `InstancedMesh`.
- Mercedes tidak dipakai di situs: merek dagang nyata dan lisensi aset tidak diketahui.
