# Pelajaran dari aset referensi tambahan

Empat aset milik pengguna dibaca hanya untuk mempelajari detailnya. Berkas sumber dan turunannya tidak disimpan di repo
karena lisensinya belum jelas. Yang dipakai di situs adalah model buatan sendiri yang meniru pola detailnya.

| Aset | Isi | Yang dipelajari | Diterapkan di |
|---|---|---|---|
| Telescope.blend | 9 objek, 31.550 vertex | Hierarki tabung, dudukan, dan tripod; tabung pencari dengan dua braket bercincin; profil tabung bertingkat dengan cincin; logam murni (metallic 1, roughness 0,1 sampai 0,3) | Teleskop refraktor kuningan di CELESTE: kaki tripod tiga bagian dengan klem, kolom bertingkat, garpu dudukan, tudung embun, okuler, tabung pencari |
| shoe.obj | Sepasang sepatu, 75.644 segitiga, 2 bahan | Sol dua tingkat dengan alur, panel samping, kerah berlapis, mata tali, simpul tali sebagai geometri | Sepatu KAZE: alur sol, lug tapak, kerah berbantalan, simpul dan ekor tali, tab tumit |
| Tree1.3ds | Ginkgo: 8.967 daun kipas 5 segitiga, 38.185 segitiga cabang | Daun adalah geometri, bukan kartu bertekstur. Cabang bertingkat dengan penyempitan | Pohon FLORA: batang dan cabang bertingkat dari tabung meruncing, ribuan daun kipas instancing |
| MercedesBenzGLS580.fbx | 361.236 segitiga, 23 bahan | Panel dan celah, velg berjari banyak, gril dan lampu berlapis, wiper, rel atap, spion, interior | Acuan untuk mobil VOLT. Tidak dipakai langsung: merek dagang nyata dan lisensi tidak diketahui |

## Catatan teknis

- Aset bisa dibuka lewat `bpy`. `.3ds` tidak didukung Blender 5, jadi dibaca dengan pembaca chunk sederhana (numpy).
- Untuk web, mesh sumber perlu didekimasi keras (sepatu 75 ribu ke 2,6 ribu segitiga per sepatu, pohon 47 ribu ke 6 ribu).
- Modifier Subsurf pada aset Blender harus diterapkan sebelum ekspor glTF, dan bahan perlu diberi nama agar Three.js dapat
  mengganti warna per bagian.
- Sumbu: OBJ mentah dari Blender memuat objek dengan rotasi X 90 derajat. Periksa bounding box sebelum menormalkan.
