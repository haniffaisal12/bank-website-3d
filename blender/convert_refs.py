"""Mengubah aset referensi milik pengguna (Telescope.blend, shoe.obj, Tree1.3ds) menjadi GLB yang ringan untuk web.
  python convert_refs.py --telescope Telescope.blend --shoe shoe.obj --tree Tree1.3ds [--only telescope|shoe|tree] [--preview]
Keluaran: assets/models/{telescope,shoe,shoe_lo,ginkgo,ginkgo_lo}.glb dan telescope.json.
Aset sumber tidak disertakan di repo (lisensinya milik pemiliknya)."""
import bpy,bmesh,sys,os,math,json,random,argparse
from mathutils import Vector,Matrix
import numpy as np
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.abspath(os.path.join(HERE,'..','assets','models'));PREV=os.path.join(HERE,'out');os.makedirs(OUT,exist_ok=True);os.makedirs(PREV,exist_ok=True)
ap=argparse.ArgumentParser();ap.add_argument('--telescope');ap.add_argument('--shoe');ap.add_argument('--tree');ap.add_argument('--only');ap.add_argument('--preview',action='store_true')
A=ap.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else sys.argv[1:])
def reset():bpy.ops.wm.read_factory_settings(use_empty=True)
def world_verts(ob):
    m=ob.matrix_world;return np.array([(m@v.co)[:] for v in ob.data.vertices])
def apply_mods(ob,sub_levels=1):
    bpy.context.view_layer.objects.active=ob
    for x in bpy.context.selected_objects:x.select_set(False)
    ob.select_set(True)
    for m in list(ob.modifiers):
        if m.type=='SUBSURF':m.levels=sub_levels;m.render_levels=sub_levels
        try:bpy.ops.object.modifier_apply(modifier=m.name)
        except RuntimeError as e:print('  gagal menerapkan',m.name,e)
    ob.select_set(False)
def export(path,objs=None,**kw):
    if objs is not None:
        for x in bpy.data.objects:x.select_set(False)
        for x in objs:x.select_set(True)
        kw['use_selection']=True
    bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',export_yup=True,export_apply=False,**kw)
    print('  ->',os.path.basename(path),round(os.path.getsize(path)/1024),'KB')
def preview(name,cam,tgt,lens=60,res=(1100,740),samples=32):
    HDRI=os.path.abspath(os.path.join(HERE,'..','assets','hdri','studio.exr'))
    w=bpy.data.worlds.new('W');bpy.context.scene.world=w;w.use_nodes=True;n=w.node_tree.nodes;l=w.node_tree.links;n.clear()
    tex=n.new('ShaderNodeTexEnvironment');tex.image=bpy.data.images.load(HDRI);bg=n.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=1.2;o=n.new('ShaderNodeOutputWorld');l.new(tex.outputs[0],bg.inputs[0]);l.new(bg.outputs[0],o.inputs[0])
    sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=samples;sc.cycles.use_denoising=True;sc.cycles.device='CPU';sc.render.resolution_x,sc.render.resolution_y=res;sc.view_settings.view_transform='AgX'
    bpy.ops.object.camera_add(location=cam);c=bpy.context.object;c.data.lens=lens;c.data.clip_end=1000
    t=c.constraints.new('TRACK_TO');e=bpy.data.objects.new('t',None);e.location=tgt;bpy.context.collection.objects.link(e);t.target=e;t.track_axis='TRACK_NEGATIVE_Z';t.up_axis='UP_Y'
    sc.camera=c;sc.render.filepath=os.path.join(PREV,name);sc.render.image_settings.file_format='JPEG';bpy.ops.render.render(write_still=True)

# ---------- teleskop ----------
def do_telescope():
    print('teleskop');reset();bpy.ops.wm.open_mainfile(filepath=A.telescope)
    root=bpy.data.objects['Telescope'];tube=bpy.data.objects['Cylinder.001']
    # pusatkan: titik tumpu tripod ke x,y = 0, kaki menyentuh z = 0
    bpy.context.view_layer.update()
    allv=np.vstack([world_verts(o) for o in bpy.data.objects if o.type=='MESH']);cx=(allv[:,0].min()+allv[:,0].max())/2;cy=(allv[:,1].min()+allv[:,1].max())/2;zmin=allv[:,2].min()
    root.location-=Vector((cx,cy,zmin));bpy.context.view_layer.update()
    tv=world_verts(tube);c=tv.mean(axis=0);u,s,vt=np.linalg.svd(tv-c,full_matrices=False);ax=vt[0]
    if ax[1]<0:ax=-ax                                    # arahkan ke ujung objektif (sumbu Y Blender positif)
    ax=ax/np.linalg.norm(ax);piv=np.array(tube.matrix_world.translation)
    yup=lambda v:[float(v[0]),float(v[2]),float(-v[1])]
    height=float(world_verts(root).max(axis=0)[2]) if False else float(np.vstack([world_verts(o) for o in bpy.data.objects if o.type=='MESH'])[:,2].max())
    meta={'tube':'Cylinder.001','pivot':yup(piv),'axis':yup(ax),'height':height,'tubeLength':float(s[0]*2/math.sqrt(len(tv))*math.sqrt(3))}
    json.dump(meta,open(os.path.join(OUT,'telescope.json'),'w'));print('  meta',meta)
    for o in [x for x in bpy.data.objects if x.type=='MESH']:
        o.data=o.data.copy() if o.data.users>1 else o.data;apply_mods(o,1 if o.name in('Cylinder.001','Telescope') else 0)
        if o.name.startswith('Bolt'):
            md=o.modifiers.new('dec','DECIMATE');md.ratio=.12;apply_mods(o,0)
    export(os.path.join(OUT,'telescope.glb'))
    if A.preview:preview('telescope_conv.jpg',(height*.9,-height*1.2,height*.7),(0,0,height*.55))
# ---------- sepatu ----------
def do_shoe():
    print('sepatu');reset();bpy.ops.wm.obj_import(filepath=A.shoe)
    ob=bpy.data.objects[0];me=ob.data
    bm=bmesh.new();bm.from_mesh(me);bm.verts.ensure_lookup_table();seen=set();parts=[]
    for v in bm.verts:
        if v.index in seen:continue
        st=[v];seen.add(v.index);comp=[]
        while st:
            a=st.pop();comp.append(a)
            for e in a.link_edges:
                b=e.other_vert(a)
                if b.index not in seen:seen.add(b.index);st.append(b)
        parts.append(comp)
    # sepatu kiri = komponen dengan pusat x di bawah celah antar sepatu
    xs=sorted(sum(v.co.x for v in c)/len(c) for c in parts);gap=xs[len(xs)//2] if False else -8.0
    drop=set()
    for c in parts:
        cx=sum(v.co.x for v in c)/len(c)
        if cx>gap:drop.update(v.index for v in c)
    bmesh.ops.delete(bm,geom=[bm.verts[i] for i in drop],context='VERTS')
    bm.to_mesh(me);bm.free()
    # materi: Sole (bawah), Upper (hitam), Accent (pink=tali)
    me.materials.append(bpy.data.materials.new('Sole'))
    sole_i=len(me.materials)-1
    zs=[v.co.y for v in me.vertices];ztop=max(zs);zmin=min(zs)      # koordinat lokal mentah: Y = atas
    for p in me.polygons:
        if p.material_index==0 and p.center.y<zmin+(ztop-zmin)*.20:p.material_index=sole_i
    me.materials[0].name='Upper';me.materials[1].name='Accent'
    # normalisasi: panjang ke sumbu X = 2.3, kaki di z=0, pusat di origin
    vs=np.array([v.co[:] for v in me.vertices]);mn=vs.min(axis=0);mx=vs.max(axis=0);cen=(mn+mx)/2
    k=2.3/(mx[2]-mn[2])                                   # panjang sepatu ada di sumbu Z lokal
    for v in me.vertices:
        x,y,z=v.co;v.co=Vector((-(z-cen[2])*k,-(x-cen[0])*k,(y-mn[1])*k))   # (panjang, lebar, tinggi) -> (-X, -Y, Z): putaran 180 derajat, moncong ke +X
    ob.rotation_euler=(0,0,0)
    me.update()
    for p in me.polygons:p.use_smooth=True
    ob.name='Sepatu'
    def variant(name,ratio):
        bpy.ops.object.select_all(action='DESELECT');dup=ob.copy();dup.data=ob.data.copy();bpy.context.collection.objects.link(dup);dup.name=name
        if ratio<1:
            m=dup.modifiers.new('dec','DECIMATE');m.ratio=ratio;m.use_collapse_triangulate=True
        apply_mods(dup)
        return dup
    hi=variant('SepatuHi',.30);lo=variant('SepatuLo',.035)
    bpy.data.objects.remove(ob)
    for o,nm in((hi,'shoe.glb'),(lo,'shoe_lo.glb')):
        vs=np.array([v.co[:] for v in o.data.vertices]);print('  ',nm,len(o.data.polygons),'poli','bbox',vs.min(axis=0).round(2),vs.max(axis=0).round(2))
        export(os.path.join(OUT,nm),[o])
    if A.preview:
        for m in bpy.data.materials:
            m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF'];b.inputs['Base Color'].default_value={'Upper':(.9,.9,.9,1),'Accent':(1,.1,.6,1),'Sole':(.05,.05,.05,1)}.get(m.name,(.5,.5,.5,1));b.inputs['Roughness'].default_value=.5
        lo.hide_render=True;hi.hide_render=False
        bpy.ops.mesh.primitive_plane_add(size=40,location=(0,0,-.01))
        preview('shoe_conv.jpg',(3.5,-3.5,2.2),(0,0,.7),lens=70)
# ---------- pohon ginkgo ----------
def do_tree():
    print('pohon');sys.path.insert(0,HERE);import tools_3ds
    reset();tmp=os.path.join(PREV,'tree_tmp.obj');o,m=tools_3ds.parse(A.tree);tools_3ds.write_obj(o,m,tmp)
    bpy.ops.wm.obj_import(filepath=tmp,forward_axis='NEGATIVE_Y',up_axis='Z')     # sumbu Z ke atas, tanpa rotasi tambahan
    meshes=[x for x in bpy.data.objects if x.type=='MESH']
    # gabungkan
    for x in meshes:x.select_set(True)
    bpy.context.view_layer.objects.active=meshes[0];bpy.ops.object.join();ob=bpy.context.active_object;me=ob.data
    names=[mm.name for mm in me.materials];print('  bahan',names)
    # susun ulang bahan: Bark (semua Rinde*, Material) dan Leaf
    leaf_i=[i for i,n in enumerate(names) if n=='Rinde_Leaf']
    bm=bmesh.new();bm.from_mesh(me);bm.faces.ensure_lookup_table()
    # normalisasi tinggi = 10 dan dasar di z=0, pusat di xy=0
    vs=np.array([v.co[:] for v in bm.verts]);mn=vs.min(axis=0);mx=vs.max(axis=0);k=10.0/(mx[2]-mn[2]);cx=(mn[0]+mx[0])/2;cy=(mn[1]+mx[1])/2
    for v in bm.verts:v.co=Vector(((v.co.x-cx)*k,(v.co.y-cy)*k,(v.co.z-mn[2])*k))
    # komponen daun
    seen=set();leaves=[]
    for f in bm.faces:
        if f.index in seen or f.material_index not in leaf_i:continue
        st=[f];seen.add(f.index);c=[]
        while st:
            a=st.pop();c.append(a)
            for e in a.edges:
                for b in e.link_faces:
                    if b.index not in seen and b.material_index in leaf_i:seen.add(b.index);st.append(b)
        leaves.append([f.index for f in c])
    print('  daun',len(leaves),'tris dahan',sum(1 for f in bm.faces if f.material_index not in leaf_i))
    random.seed(7);tree_src=bm.copy();bm.free()
    def make(name,keep,grow,dec):
        b=tree_src.copy();b.faces.ensure_lookup_table()
        # petakan ulang daun (indeks komponen sama karena salinan)
        lf=[[b.faces[i] for i in c] for c in leaves];kill=[]
        for c in lf:
            if random.random()>keep:kill+=c
            else:
                vs_={v for f in c for v in f.verts};cen=sum((v.co for v in vs_),Vector())/len(vs_)
                for v in vs_:v.co=cen+(v.co-cen)*grow
        bmesh.ops.delete(b,geom=list(set(kill)),context='FACES')
        # buang vertex yatim
        bmesh.ops.delete(b,geom=[v for v in b.verts if not v.link_faces],context='VERTS')
        me2=bpy.data.meshes.new(name);b.to_mesh(me2);b.free()
        for mm in me.materials:me2.materials.append(mm)
        o2=bpy.data.objects.new(name,me2);bpy.context.collection.objects.link(o2)
        for p in me2.polygons:p.use_smooth=True
        if dec<1:
            md=o2.modifiers.new('dec','DECIMATE');md.ratio=dec;md.use_collapse_triangulate=True
            apply_mods(o2)
        return o2
    hi=make('GinkgoHi',.42,1.45,.55);lo=make('GinkgoLo',.13,2.4,.14)
    bpy.data.objects.remove(ob)
    # nama bahan baku untuk web
    for o2 in(hi,lo):
        for mm in o2.data.materials:
            if mm.name!='Rinde_Leaf':mm.name='Bark' if mm.name.startswith('Rinde') or mm.name=='Material' else mm.name
    for o2,nm in((hi,'ginkgo.glb'),(lo,'ginkgo_lo.glb')):
        print('  ',nm,len(o2.data.polygons),'poli');export(os.path.join(OUT,nm),[o2])
    if A.preview:
        for m in bpy.data.materials:
            m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF'];b.inputs['Base Color'].default_value=(.15,.4,.1,1) if 'Leaf' in m.name else (.2,.13,.08,1)
        lo.location=(9,0,0);hi.hide_viewport=False;lo.hide_viewport=False
        bpy.ops.mesh.primitive_plane_add(size=80,location=(0,0,-.01))
        preview('tree_conv.jpg',(4,-22,7),(4.5,0,5),lens=45)
    for o2 in(hi,lo):print('  ',o2.name,len(o2.data.polygons),'poli (sebelum dekimasi)')
if not A.only or A.only=='telescope':do_telescope()
if not A.only or A.only=='shoe':do_shoe()
if not A.only or A.only=='tree':do_tree()
print('selesai')
