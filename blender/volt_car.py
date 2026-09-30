"""VOLT E-1: bodi mobil, render Cycles, dan ekspor GLB.
Jalankan:  python volt_car.py [render|glb|both] [warna_hex]
Butuh paket `bpy` (pip install bpy) atau Blender: blender -b -P volt_car.py -- render
"""
import bpy,bmesh,math,sys,os
from mathutils import Vector
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'out');os.makedirs(OUT,exist_ok=True)
MODE=sys.argv[1] if len(sys.argv)>1 and sys.argv[1] in('render','glb','both') else 'both'
PAINT=int(sys.argv[2],16) if len(sys.argv)>2 else 0xB50F26

def herm(keys,x):
    if x<=keys[0][0]:return keys[0][1]
    for a,b in zip(keys,keys[1:]):
        if x<=b[0]:
            t=(x-a[0])/(b[0]-a[0]);s=t*t*(3-2*t);return a[1]+(b[1]-a[1])*s
    return keys[-1][1]
def sgn(v,p):return math.copysign(abs(v)**p,v)
def srgb2lin(c):
    r,g,b=[(c>>16&255)/255,(c>>8&255)/255,(c&255)/255]
    f=lambda u:u/12.92 if u<=.04045 else((u+.055)/1.055)**2.4
    return (f(r),f(g),f(b),1)

def loft(x0,x1,N,M,ring,name):
    me=bpy.data.meshes.new(name);bm=bmesh.new();rows=[]
    for i in range(N+1):
        x=x0+(x1-x0)*i/N;pts=ring(x)
        rows.append([bm.verts.new((x,z,y)) for (z,y) in pts])   # blender: X maju, Y lebar, Z tinggi
    for i in range(N):
        for j in range(M):
            bm.faces.new((rows[i][j],rows[i+1][j],rows[i+1][(j+1)%M],rows[i][(j+1)%M]))
    for end,rev in((0,True),(N,False)):
        f=bm.faces.new(rows[end][::-1] if rev else rows[end])
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    bm.to_mesh(me);bm.free()
    ob=bpy.data.objects.new(name,me);bpy.context.collection.objects.link(ob)
    for p in me.polygons:p.use_smooth=True
    return ob

L=2.35
belt=[(-L,.52),(-2.1,.8),(-1.6,.9),(-.4,.95),(.9,.93),(1.5,.84),(2.0,.7),(L,.46)]
def body_ring(x):
    top=herm(belt,x);bot=.27+.06*(abs(x)/L)**3;mid=(top+bot)/2;hh=(top-bot)/2
    nose=max(0,1-(abs(x)/L)**6)**.5;w=.93*(1-.16*(abs(x)/L)**3)*nose;pts=[]
    for j in range(48):
        a=j/48*math.tau;pts.append((w*sgn(math.cos(a),2/2.7),mid+hh*sgn(math.sin(a),2/2.7)))
    return pts
roof=[(-1.65,.9),(-1.35,1.24),(-.6,1.42),(.3,1.4),(.75,1.2),(1.08,.94)]
def cabin_ring(x):
    top=max(herm(roof,x),herm(belt,x)+.01);bot=herm(belt,x)-.02;mid=(top+bot)/2;hh=(top-bot)/2
    edge=min(1,min(x+1.65,1.08-x)*6);pts=[]
    for j in range(40):
        a=j/40*math.tau;c,s=math.cos(a),math.sin(a);t=(s+1)/2
        w=(.84-.34*t**1.4)*max(edge,.001)**.5;pts.append((w*sgn(c,.85),mid+hh*sgn(s,.85)))
    return pts

def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
def mat_principled(name,color,metal=0,rough=.5,**kw):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=color;b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
    for k,v in kw.items():
        if k in b.inputs:b.inputs[k].default_value=v
    return m

def build_car(paint):
    car=bpy.data.objects.new('VOLT_E1',None);bpy.context.collection.objects.link(car)
    pm=mat_principled('Cat',srgb2lin(paint),metal=.6,rough=.28,**{'Coat Weight':1.0,'Coat Roughness':.03})
    gm=mat_principled('Kaca',(.01,.012,.018,1),metal=.2,rough=.03,**{'Coat Weight':1.0})
    black=mat_principled('Karet',(.012,.012,.014,1),rough=.55)
    chrome=mat_principled('Krom',(.9,.9,.92,1),metal=1,rough=.15)
    rimM=mat_principled('Velg',(.75,.77,.8,1),metal=1,rough=.22)
    lamp=mat_principled('Lampu',(1,1,1,1),rough=.1);lamp.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value=(.85,.9,1,1);lamp.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=6
    tail=mat_principled('LampuBelakang',(.5,0,0,1),rough=.2);tail.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value=(1,.02,.02,1);tail.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value=8
    body=loft(-L,L,120,48,body_ring,'Bodi');body.data.materials.append(pm)
    cab=loft(-1.65,1.08,80,40,cabin_ring,'Kabin');cab.data.materials.append(gm)
    for ob in(body,cab):
        ob.parent=car
        sm=ob.modifiers.new('sub','SUBSURF');sm.levels=1;sm.render_levels=2
    # sil/rocker
    bpy.ops.mesh.primitive_cube_add(size=1,location=(0,0,.29));sk=bpy.context.object;sk.scale=(2.15,.9,.05);sk.data.materials.append(black);sk.parent=car;sk.name='Sill'
    # roda
    for (x,s) in((1.42,1),(1.42,-1),(-1.42,1),(-1.42,-1)):
        bpy.ops.mesh.primitive_torus_add(major_radius=.28,minor_radius=.11,major_segments=64,minor_segments=24,location=(x,s*.86,.36),rotation=(math.pi/2,0,0))
        t=bpy.context.object;t.data.materials.append(black);t.parent=car;t.name='Ban'
        for p in t.data.polygons:p.use_smooth=True
        bpy.ops.mesh.primitive_cylinder_add(radius=.29,depth=.14,vertices=64,location=(x,s*.86,.36),rotation=(math.pi/2,0,0))
        d=bpy.context.object;d.data.materials.append(rimM);d.parent=car;d.name='VelgDisk'
        bev=d.modifiers.new('bev','BEVEL');bev.width=.012;bev.segments=3
        for k in range(5):
            a=k*math.tau/5
            bpy.ops.mesh.primitive_cube_add(size=1,location=(x,s*.86+s*.075,.36+math.sin(a)*.14),rotation=(0,0,0));sp=bpy.context.object
            sp.location=(x+math.cos(a)*.0,s*.86+s*.075,.36);sp.scale=(.045,.03,.25);sp.rotation_euler=(0,a,0);sp.data.materials.append(chrome);sp.parent=car
    # lampu
    bpy.ops.mesh.primitive_cube_add(size=1,location=(2.27,0,.62));h=bpy.context.object;h.scale=(.03,1.5,.035);h.data.materials.append(lamp);h.parent=car;h.name='LampuDepan'
    for s in(-1,1):
        bpy.ops.mesh.primitive_cube_add(size=1,location=(2.24,s*.62,.6));e=bpy.context.object;e.scale=(.05,.32,.04);e.data.materials.append(lamp);e.parent=car
    bpy.ops.mesh.primitive_cube_add(size=1,location=(-2.3,0,.72));t=bpy.context.object;t.scale=(.03,1.55,.04);t.data.materials.append(tail);t.parent=car;t.name='LampuBelakang'
    return car

def studio(hdri):
    w=bpy.data.worlds.new('W');bpy.context.scene.world=w;w.use_nodes=True
    n=w.node_tree.nodes;l=w.node_tree.links;n.clear()
    tex=n.new('ShaderNodeTexEnvironment');tex.image=bpy.data.images.load(hdri)
    bg=n.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=.8;out=n.new('ShaderNodeOutputWorld')
    l.new(tex.outputs['Color'],bg.inputs['Color']);l.new(bg.outputs['Background'],out.inputs['Surface'])
    # lantai
    bpy.ops.mesh.primitive_circle_add(vertices=128,radius=40,fill_type='NGON',location=(0,0,0));f=bpy.context.object
    fm=mat_principled('Lantai',(.02,.022,.028,1),metal=.1,rough=.12);f.data.materials.append(fm)
    # lampu area softbox
    for (loc,rot,sz,en,col) in [((-4,-5,4),(1.1,0,-.6),4,900,(1,1,1)),((5,-3,3),(1.2,0,.8),3,500,(.85,.92,1)),((0,0,6),(0,0,0),5,300,(1,1,1))]:
        bpy.ops.object.light_add(type='AREA',location=loc,rotation=rot);a=bpy.context.object;a.data.size=sz;a.data.energy=en;a.data.color=col
    bpy.ops.mesh.primitive_torus_add(major_radius=3.3,minor_radius=.035,major_segments=128,minor_segments=8,location=(0,0,.02))
    ring=bpy.context.object;rm=bpy.data.materials.new('Cincin');rm.use_nodes=True;b=rm.node_tree.nodes['Principled BSDF'];b.inputs['Emission Color'].default_value=(.85,1,.15,1);b.inputs['Emission Strength'].default_value=10;b.inputs['Base Color'].default_value=(0,0,0,1);ring.data.materials.append(rm)

def render(path,res=(1280,720),samples=96,cam=((6.2,-5.4,1.3),(0,0,.55)),lens=42):
    sc=bpy.context.scene;sc.render.engine='CYCLES'
    prefs=sc.cycles;prefs.samples=samples;prefs.use_denoising=True;prefs.denoiser='OPENIMAGEDENOISE';prefs.device='CPU'
    prefs.max_bounces=8;prefs.glossy_bounces=6;prefs.caustics_reflective=False;prefs.caustics_refractive=False
    sc.render.resolution_x,sc.render.resolution_y=res;sc.render.resolution_percentage=100
    sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
    bpy.ops.object.camera_add(location=cam[0]);c=bpy.context.object;c.data.lens=lens;c.data.dof.use_dof=True;c.data.dof.aperture_fstop=5.6
    d=c.constraints.new('TRACK_TO');empty=bpy.data.objects.new('t',None);empty.location=cam[1];bpy.context.collection.objects.link(empty)
    d.target=empty;d.track_axis='TRACK_NEGATIVE_Z';d.up_axis='UP_Y';c.data.dof.focus_object=empty
    sc.camera=c;sc.render.filepath=path;sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=90
    bpy.ops.render.render(write_still=True)

clear_scene()
car=build_car(PAINT)
if MODE in('render','both'):
    studio(os.path.join(HERE,'..','assets','hdri','studio.exr'))
    render(os.path.join(OUT,'volt_render.jpg'))
if MODE in('glb','both'):
    for o in list(bpy.data.objects):
        if o.type in('MESH',) and o.name.startswith(('Lantai','Torus')):bpy.data.objects.remove(o)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'volt_car.glb'),export_format='GLB',use_selection=False,export_apply=True,export_yup=True,export_cameras=False,export_lights=False)
print('selesai')
