"""Alat seduh KAWAH KOPI untuk web: set V60 (dripper keramik, kertas saring, server kaca) dan ketel leher angsa.
  blender -b -P blender/kopi_alat_seduh.py      keluaran: blender/out/v60_set.glb, blender/out/gooseneck.glb
Satuan meter, Z atas, alas di 0; ukuran mengikuti model prosedural lama di js/world/kopi.js (server 11,5 cm,
dripper di atasnya; ketel 14 cm dengan cerat sampai x = 21,5 cm). Bahan bernama untuk Three.js:
V60  -> Keramik (warna varian diatur di JS), Kaca, Kopi, Kertas
Ketel -> Baja, Hitam"""
import bpy,bmesh,math,os
import numpy as np
from mathutils import Vector,Matrix
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'out');os.makedirs(OUT,exist_ok=True)

def link(ob,parent=None):
    bpy.context.collection.objects.link(ob)
    if parent:ob.parent=parent
    return ob
def mat(name,rgb,rough,metal=0,alpha=1):
    m=bpy.data.materials.new(name);m.use_nodes=True
    b=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value=(*rgb,1);b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
    if alpha<1:b.inputs['Alpha'].default_value=alpha
    return m

def lathe(name,prof,mat,seg=64,smooth=True,close_top=False):
    """prof: [(r,z)] dari bawah ke atas; r=0 menutup di sumbu"""
    bm=bmesh.new();rings=[]
    for r,z in prof:
        if r<=1e-6:rings.append([bm.verts.new((0,0,z))]);continue
        rings.append([bm.verts.new((r*math.cos(a),r*math.sin(a),z)) for a in np.linspace(0,2*math.pi,seg,endpoint=False)])
    for a,b in zip(rings,rings[1:]):
        if len(a)==1 and len(b)==1:continue
        if len(a)==1:
            for i in range(seg):bm.faces.new((a[0],b[i],b[(i+1)%seg]))
        elif len(b)==1:
            for i in range(seg):bm.faces.new((a[i],b[0],a[(i+1)%seg]))
        else:
            for i in range(seg):bm.faces.new((a[i],a[(i+1)%seg],b[(i+1)%seg],b[i]))
    for f in bm.faces:f.smooth=smooth
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.materials.append(mat)
    return link(bpy.data.objects.new(name,me))

def tube(name,pts,radii,mat,res=3,caps=True):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.bevel_depth=1.0;cu.bevel_resolution=res;cu.fill_mode='FULL';cu.use_fill_caps=caps
    sp=cu.splines.new('POLY');sp.points.add(len(pts)-1)
    for p,v,r in zip(sp.points,pts,radii):p.co=(v[0],v[1],v[2],1);p.radius=r
    ob=link(bpy.data.objects.new(name,cu));cu.materials.append(mat)
    me=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    m=link(bpy.data.objects.new(name,me));bpy.data.objects.remove(ob)
    for p in me.polygons:p.use_smooth=True
    return m
def smooth_curve(ctrl,n=40):
    """Catmull-Rom melalui titik kontrol"""
    P=[Vector(c) for c in ctrl];P=[P[0]+(P[0]-P[1])]+P+[P[-1]+(P[-1]-P[-2])];out=[]
    for i in range(1,len(P)-2):
        p0,p1,p2,p3=P[i-1],P[i],P[i+1],P[i+2]
        for t in np.linspace(0,1,n//(len(ctrl)-1),endpoint=False):
            out.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t**3))
    out.append(Vector(ctrl[-1]));return out
def solid(ob,t,off=-1):
    s=ob.modifiers.new('tebal','SOLIDIFY');s.thickness=t;s.offset=off;return ob

# ================= set V60 =================
def build_v60():
    K=mat('Keramik',(.11,.10,.10),.3);G=mat('Kaca',(.95,.97,1),.03,alpha=.2);C=mat('Kopi',(.08,.035,.015),.12);P=mat('Kertas',(.95,.93,.88),.95)
    root=link(bpy.data.objects.new('SetV60',None))
    # server kaca: dinding tipis, bibir sedikit melebar, cerat kecil
    prof=[(0,0),(.046,0),(.052,.003),(.057,.012),(.059,.03),(.06,.07),(.056,.093),(.05,.105),(.047,.111),(.048,.115)]
    srv=lathe('Server',prof,G,seg=72);solid(srv,.0028);srv.parent=root
    for v in srv.data.vertices:   # cerat: tarik bibir ke +X
        a=math.atan2(v.co.y,v.co.x)
        if v.co.z>.104 and abs(a)<.35:v.co.x+=.006*(1-abs(a)/.35)*((v.co.z-.104)/.011);v.co.z+=.002*(1-abs(a)/.35)
    # pegangan kaca: lengkung terbuka di sisi -X
    hp=smooth_curve([(-.058,0,.092),(-.083,0,.088),(-.092,0,.06),(-.08,0,.032),(-.059,0,.028)],40)
    tube('PeganganServer',hp,[.0065]*len(hp),G).parent=root
    # kopi dengan meniskus
    cof=lathe('Kopi',[(0,.004),(.052,.004),(.0565,.02),(.0572,.044),(.054,.046),(0,.0465)],C,seg=64);cof.parent=root
    # dripper keramik di atas server (z = .115)
    z0=.115
    outer=[(.055,z0),(.055,z0+.006),(.03,z0+.007),(.024,z0+.011),(.028,z0+.02),(.064,z0+.076),(.07,z0+.08),(.071,z0+.084)]
    inner=[(.067,z0+.084),(.061,z0+.079),(.016,z0+.012),(.012,z0+.009)]
    prof=outer+inner+[(.012,z0+.003),(.05,z0+.003),(.05,z0),(.055,z0)]
    drp=lathe('Dripper',[(r,z) for r,z in prof],K,seg=72);drp.parent=root
    # rusuk spiral di dinding dalam (ciri khas V60)
    for k in range(12):
        pts=[]
        for t in np.linspace(.08,.96,22):
            z=z0+.012+t*(.067);r=.016+t*(.045)-.0015;a=k*2*math.pi/12+t*1.25
            pts.append((r*math.cos(a),r*math.sin(a),z))
        tube('Rusuk',pts,[.0016]*len(pts),K,res=1).parent=root
    # pegangan dripper: loop pipih di sisi +X
    hp=smooth_curve([(.05,0,z0+.06),(.085,0,z0+.064),(.1,0,z0+.045),(.092,0,z0+.022),(.06,0,z0+.016)],40)
    h=tube('PeganganDripper',hp,[.0055]*len(hp),K);h.scale=(1,2.2,1);h.parent=root
    # kertas saring: kerucut tipis, tepi atas bergelombang, lipatan sambungan
    seg=160;bm=bmesh.new();rows=[]
    for i,t in enumerate(np.linspace(0,1,14)):
        r=.02+t*.044;z=z0+.014+t*.08;row=[]
        for j,a in enumerate(np.linspace(0,2*math.pi,seg,endpoint=False)):
            w=1+(.018*math.cos(a*16))*t**3      # lipatan kecil makin jelas ke atas
            zz=z+(.0012*math.cos(a*16)*t**4)
            row.append(bm.verts.new((r*w*math.cos(a),r*w*math.sin(a),zz)))
        rows.append(row)
    for a,b in zip(rows,rows[1:]):
        for j in range(seg):bm.faces.new((a[j],a[(j+1)%seg],b[(j+1)%seg],b[j])).smooth=True
    me=bpy.data.meshes.new('Kertas');bm.to_mesh(me);bm.free();me.materials.append(P)
    pp=link(bpy.data.objects.new('Kertas',me),root);solid(pp,.0008,0)
    return root

# ================= ketel leher angsa =================
def build_kettle():
    S=mat('Baja',(.85,.86,.88),.18,1);B=mat('Hitam',(.02,.02,.02),.45)
    root=link(bpy.data.objects.new('KetelLeherAngsa',None))
    body=[(0,.002),(.068,.002),(.074,.0035),(.077,.008),(.079,.02),(.081,.07),(.08,.098),(.075,.115),(.064,.127),(.05,.134),(.046,.136),(.046,.139)]
    b=lathe('Badan',body,S,seg=80);solid(b,.0015);b.parent=root
    lathe('Alas',[(0,0),(.07,0),(.072,.003),(0,.003)],B,seg=64).parent=root
    # tutup kubah + kenop
    lathe('Tutup',[(.049,.136),(.05,.139),(.047,.142),(.038,.149),(.02,.153),(.0,.154)],S,seg=64).parent=root
    lathe('Kenop',[(0,.153),(.011,.153),(.014,.158),(.013,.168),(.009,.172),(0,.173)],B,seg=40).parent=root
    # cerat leher angsa: keluar dari dasar badan, naik, melengkung, ujung meruncing pipih
    cp=smooth_curve([(.072,0,.022),(.105,0,.032),(.128,0,.06),(.143,0,.105),(.158,0,.15),(.18,0,.172),(.205,0,.178),(.219,0,.174)],80)
    rr=[.0105-.006*(i/(len(cp)-1))**.8 for i in range(len(cp))]
    sp=tube('Cerat',cp,rr,S,res=4,caps=False);sp.parent=root
    # pangkal cerat: kerah halus menempel ke badan
    lathe('KerahCerat',[(0,0),(.013,0),(.016,.004),(.016,.012),(.012,.016)],S,seg=32).parent=root
    kc=bpy.data.objects['KerahCerat'];kc.rotation_euler=(0,math.radians(-68),0);kc.location=(.074,0,.021)
    # pegangan: lengkung ergonomis hitam + braket baja
    hp=smooth_curve([(-.068,0,.118),(-.105,0,.13),(-.135,0,.118),(-.146,0,.085),(-.138,0,.05),(-.112,0,.028),(-.078,0,.03)],80)
    hr=[.009+.004*math.sin(math.pi*i/(len(hp)-1)) for i in range(len(hp))]
    hd=tube('Pegangan',hp,hr,B,res=4);hd.scale=(1,1.25,1);hd.parent=root
    for p in((-.074,0,.112),(-.079,0,.033)):
        lathe('Braket',[(0,0),(.009,0),(.011,.004),(.011,.012),(0,.012)],S,seg=24).parent=root
        bk=bpy.data.objects['Braket'];bk.name='BraketPegangan';bk.rotation_euler=(0,math.radians(-90),0);bk.location=p
    return root

def export(root,name):
    for o in bpy.data.objects:o.select_set(False)
    def sel(o):
        o.select_set(True)
        for c in o.children:sel(c)
    sel(root)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,name),export_format='GLB',export_yup=True,export_apply=True,use_selection=True)

if __name__=='__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    v=build_v60();k=build_kettle();k.location.x=.4
    export(v,'v60_set.glb');k.location.x=0;export(k,'gooseneck.glb')
    print('selesai')
