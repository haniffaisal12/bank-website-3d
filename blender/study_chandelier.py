"""Studi aset Chandelier_03 (Poly Haven): statistik mesh dan render Cycles dengan bahan pengganti.
Tekstur aslinya tidak ikut terunggah, jadi bahan dibuat ulang: kuningan, kaca, bohlam."""
import bpy,bmesh,sys,os,math
SRC=sys.argv[1];HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'out');os.makedirs(OUT,exist_ok=True)
bpy.ops.wm.open_mainfile(filepath=SRC)
ob=bpy.data.objects['Chandelier_03']
me=ob.data
# --- statistik
bm=bmesh.new();bm.from_mesh(me)
import collections
tri=sum(1 for f in bm.faces if len(f.verts)==3);quad=sum(1 for f in bm.faces if len(f.verts)==4);ng=len(bm.faces)-tri-quad
# bagian terpisah
seen=set();parts=[]
for v in bm.verts:
    if v.index in seen:continue
    stack=[v];comp=[];seen.add(v.index)
    while stack:
        a=stack.pop();comp.append(a)
        for e in a.link_edges:
            b=e.other_vert(a)
            if b.index not in seen:seen.add(b.index);stack.append(b)
    parts.append(comp)
mat_faces=collections.Counter(f.material_index for f in bm.faces)
# panjang sisi
lens=sorted(e.calc_length() for e in bm.edges)
# sudut sisi tajam vs halus
sharp=sum(1 for e in bm.edges if len(e.link_faces)==2 and e.calc_face_angle(0)>math.radians(35))
print(f'verts={len(bm.verts)} faces={len(bm.faces)} tri={tri} quad={quad} ngon={ng}')
print('bagian terpisah',len(parts),'ukuran terbesar',sorted((len(p) for p in parts),reverse=True)[:8])
print('faces per material',dict(mat_faces),'uv layers',[u.name for u in me.uv_layers])
print(f'panjang sisi: min={lens[0]*1000:.2f}mm median={lens[len(lens)//2]*1000:.2f}mm max={lens[-1]*1000:.1f}mm')
print('sisi tajam (>35 derajat):',sharp,'dari',len(bm.edges),'| smooth shading polys:',sum(p.use_smooth for p in me.polygons))
print('custom normals:',me.has_custom_normals,'attributes',[a.name for a in me.attributes])
bm.free()
# --- bahan pengganti
def principled(m):
    m.use_nodes=True;n=m.node_tree.nodes;n.clear();o=n.new('ShaderNodeOutputMaterial');b=n.new('ShaderNodeBsdfPrincipled');m.node_tree.links.new(b.outputs[0],o.inputs[0]);return b
mats=me.materials
b=principled(mats[0]);b.inputs['Base Color'].default_value=(.62,.42,.16,1);b.inputs['Metallic'].default_value=1;b.inputs['Roughness'].default_value=.28
b=principled(mats[1]);b.inputs['Base Color'].default_value=(1,.85,.6,1);b.inputs['Emission Color'].default_value=(1,.72,.38,1);b.inputs['Emission Strength'].default_value=30;b.inputs['Roughness'].default_value=.2
b=principled(mats[2]);b.inputs['Base Color'].default_value=(.95,.97,1,1);b.inputs['Roughness'].default_value=.02;b.inputs['Transmission Weight'].default_value=1;b.inputs['IOR'].default_value=1.5
# --- adegan
bpy.ops.mesh.primitive_plane_add(size=30,location=(0,0,-1.2));fl=bpy.context.object
fm=bpy.data.materials.new('lantai');b=principled(fm);b.inputs['Base Color'].default_value=(.06,.055,.05,1);b.inputs['Roughness'].default_value=.25;fl.data.materials.append(fm)
bpy.ops.mesh.primitive_plane_add(size=30,location=(0,3,0),rotation=(math.pi/2,0,0));wl=bpy.context.object
wm=bpy.data.materials.new('dinding');b=principled(wm);b.inputs['Base Color'].default_value=(.04,.04,.045,1);b.inputs['Roughness'].default_value=.6;wl.data.materials.append(wm)
from mathutils import Vector
bb=[ob.matrix_world@Vector(c) for c in ob.bound_box];lo=Vector((min(v.x for v in bb),min(v.y for v in bb),min(v.z for v in bb)));hi=Vector((max(v.x for v in bb),max(v.y for v in bb),max(v.z for v in bb)))
CEN=(lo+hi)/2;print('bbox',tuple(round(v,3) for v in lo),tuple(round(v,3) for v in hi))
fl.location.z=lo.z-.05;wl.location.y=hi.y+1.2
w=bpy.data.worlds.new('W');bpy.context.scene.world=w;w.use_nodes=True;nt=w.node_tree;nt.nodes.clear()
tx=nt.nodes.new('ShaderNodeTexEnvironment');tx.image=bpy.data.images.load(os.path.join(HERE,'..','assets','hdri','studio.exr'));bg=nt.nodes.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=1.2;wo=nt.nodes.new('ShaderNodeOutputWorld')
nt.links.new(tx.outputs[0],bg.inputs[0]);nt.links.new(bg.outputs[0],wo.inputs[0])
bpy.ops.object.light_add(type='AREA',location=(-1.5,-1.5,.8));a=bpy.context.object;a.data.energy=60;a.data.size=1.5
def cam(loc,tgt,name,res=(1280,900),samples=96):
    sc=bpy.context.scene;sc.render.engine='CYCLES';sc.cycles.samples=samples;sc.cycles.use_denoising=True;sc.cycles.device='CPU';sc.cycles.max_bounces=12;sc.cycles.transmission_bounces=10;sc.cycles.caustics_reflective=False;sc.cycles.caustics_refractive=False
    sc.render.resolution_x,sc.render.resolution_y=res;sc.view_settings.view_transform='AgX'
    bpy.ops.object.camera_add(location=loc);c=bpy.context.object;c.data.lens=70
    t=c.constraints.new('TRACK_TO');e=bpy.data.objects.new('t',None);e.location=tgt;bpy.context.collection.objects.link(e);t.target=e;t.track_axis='TRACK_NEGATIVE_Z';t.up_axis='UP_Y'
    sc.camera=c;sc.render.filepath=os.path.join(OUT,name);sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=90
    bpy.ops.render.render(write_still=True)
if 'render' in sys.argv:
    c=CEN;cam((c.x+2.0,c.y-2.4,c.z+.4),(c.x,c.y,c.z),'chandelier_full.jpg')
    cam((c.x+.55,c.y-.75,lo.z+.3),(c.x,c.y,lo.z+.22),'chandelier_detail.jpg')
if 'glb' in sys.argv:
    import json
    # posisi ujung api lilin (komponen 96 vertex, 18 salinan) dalam koordinat Y-up glTF
    bm2=bmesh.new();bm2.from_mesh(me);seen2=set();tips=[]
    for v in bm2.verts:
        if v.index in seen2:continue
        st=[v];comp=[];seen2.add(v.index)
        while st:
            q=st.pop();comp.append(q)
            for e in q.link_edges:
                r=e.other_vert(q)
                if r.index not in seen2:seen2.add(r.index);st.append(r)
        if len(comp)==96:
            top=max(comp,key=lambda c:c.co.z);tips.append([round(top.co.x,4),round(top.co.z-.03,4),round(-top.co.y,4)])
    json.dump({'tips':tips,'height':1.041,'width':.78},open(os.path.join(OUT,'chandelier_03.json'),'w'))
    print('api lilin',len(tips))
    for o in [fl,wl,a]:bpy.data.objects.remove(o)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'chandelier_03.glb'),export_format='GLB',export_yup=True,export_apply=False,export_texcoords=False,export_image_format='NONE')
