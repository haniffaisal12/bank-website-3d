"""Ikan badut AQUARIA (Amphiprion ocellaris) untuk web.
  blender -b -P blender/aqua_clownfish.py -- [glb]      keluaran: blender/out/clownfish.glb
Sumbu: X panjang (moncong di +X), Z atas, Y samping. Satuan sama dengan ikan prosedural di js/concepts/aqua.js:
moncong x=1.5, pangkal ekor x=-1.3, ujung sirip ekor x≈-2.1.
Bagian bernama untuk animasi di Three.js: Badan, Ekor (poros di pangkal ekor), SiripDada_L/R (poros di akar sirip).
Bahan: Badan (tekstur belang), Sirip (tekstur tepi hitam), Mata, Iris. Tekstur dibuat di skrip ini (tanpa berkas luar)."""
import bpy,bmesh,math,sys,os
import numpy as np
from mathutils import Vector,Matrix
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'out');os.makedirs(OUT,exist_ok=True)

XN,XP=1.5,-1.32          # moncong, pangkal ekor
L=XN-XP

def pchip(keys):
    """Hermite monoton (Fritsch-Carlson): mulus tanpa melampaui nilai kunci."""
    xs=np.array([k[0] for k in keys],float);ys=np.array([k[1] for k in keys],float)
    h=np.diff(xs);d=np.diff(ys)/h;m=np.zeros_like(ys)
    m[0]=d[0];m[-1]=d[-1]
    for i in range(1,len(ys)-1):
        m[i]=0 if d[i-1]*d[i]<=0 else 3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/d[i-1]+(h[i]+2*h[i-1])/d[i])
    def f(x):
        x=min(max(x,xs[0]),xs[-1]);i=min(np.searchsorted(xs,x,side='right')-1,len(h)-1);t=(x-xs[i])/h[i]
        return ((2*t**3-3*t**2+1)*ys[i]+(t**3-2*t**2+t)*h[i]*m[i]+(-2*t**3+3*t**2)*ys[i+1]+(t**3-t**2)*h[i]*m[i+1])
    return f

# profil badan sebagai fungsi s (0 = moncong, 1 = pangkal ekor); dalam: punggung tinggi, badan pipih
TOP=pchip([(.12,.34),(.2,.47),(.32,.60),(.45,.62),(.62,.52),(.8,.32),(.92,.22),(1,.20)])
BOT=pchip([(.12,-.28),(.2,-.40),(.32,-.50),(.5,-.50),(.68,-.38),(.82,-.24),(.92,-.18),(1,-.17)])
WID=pchip([(.12,.17),(.2,.215),(.32,.25),(.48,.24),(.68,.17),(.85,.10),(1,.065)])
def prof(s):
    k=math.sqrt(1-(1-s/.12)**2) if s<.12 else 1.0   # moncong tumpul (seperempat elips)
    return TOP(max(s,.12))*k,BOT(max(s,.12))*k,WID(max(s,.12))*k
def sx(s):return XN-s*L
def s_of(x):return (XN-x)/L

def link(ob,parent=None):
    bpy.context.collection.objects.link(ob)
    if parent:ob.parent=parent
    return ob

def make_body(mat):
    N,M,E=72,48,2.5     # cincin, segmen, eksponen superelips (sisi agak rata)
    bm=bmesh.new();uv=bm.loops.layers.uv.new('UVMap');rings=[]
    for i in range(N):
        s=.004+(i/(N-1))**1.5*(1-.004);t,b,w=prof(s);x=sx(s);ring=[]
        for j in range(M):
            a=2*math.pi*j/M;c,sn=math.cos(a),math.sin(a)
            y=w*math.copysign(abs(c)**(2/E),c);z=(t if sn>0 else -b)*math.copysign(abs(sn)**(2/E),sn)
            ring.append(bm.verts.new((x,y,z)))
        rings.append(ring)
    nose=bm.verts.new((XN+.002,0,-.04));tail=bm.verts.new((XP-.002,0,(TOP(1)+BOT(1))*.5))
    for i in range(N-1):
        for j in range(M):
            bm.faces.new((rings[i][j],rings[i][(j+1)%M],rings[i+1][(j+1)%M],rings[i+1][j]))
    for j in range(M):
        bm.faces.new((nose,rings[0][(j+1)%M],rings[0][j]));bm.faces.new((tail,rings[-1][j],rings[-1][(j+1)%M]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    for f in bm.faces:
        f.smooth=True
        for l in f.loops:l[uv].uv=body_uv(l.vert.co)
    me=bpy.data.meshes.new('Badan');bm.to_mesh(me);bm.free();me.materials.append(mat)
    return link(bpy.data.objects.new('Badan',me))
ZMIN,ZMAX=-.62,.62
def body_uv(co):return ((co.x-XP)/L,(co.z-ZMIN)/(ZMAX-ZMIN))

def fin_mesh(name,root,tip,mat,rows=7,amp=.007,thick=.012):
    """Sirip = grid dari akar ke tepi; kolom bergantian maju-mundur sebagai jari-jari sirip."""
    n=len(root);bm=bmesh.new();uv=bm.loops.layers.uv.new('UVMap');G=[]
    for j in range(n):
        col=[]
        for i in range(rows+1):
            t=i/rows;p=root[j].lerp(tip[j],t)
            p=p+Vector((0,(1 if j%2 else -1)*amp*t,0))
            col.append(bm.verts.new(p))
        G.append(col)
    for j in range(n-1):
        for i in range(rows):
            f=bm.faces.new((G[j][i],G[j+1][i],G[j+1][i+1],G[j][i+1]));f.smooth=True
            for l in f.loops:
                jj=next(k for k in (j,j+1) if l.vert in G[k]);ii=G[jj].index(l.vert)
                l[uv].uv=(ii/rows,jj/(n-1))
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free();me.materials.append(mat)
    ob=link(bpy.data.objects.new(name,me))
    so=ob.modifiers.new('tebal','SOLIDIFY');so.thickness=thick;so.offset=0
    return ob

def body_top(x,inset=.035):s=s_of(x);t,b,w=prof(s);return t-inset
def body_bot(x,inset=.035):s=s_of(x);t,b,w=prof(s);return -b+inset

def make_fins(mat):
    fins=[]
    # sirip punggung berduri (depan): tepi bergerigi, ada lekuk sebelum sirip lunak
    n=13;xs=[.78-(.78-.06)*k/(n-1) for k in range(n)]
    root=[Vector((x,0,body_top(x))) for x in xs]
    tip=[]
    for k,x in enumerate(xs):
        q=k/(n-1);h=.14+.16*math.sin(math.pi*min(1,q*1.25))*(1-.5*q)+(.05 if k%2==0 else -.015)
        tip.append(Vector((x-.10-.05*q,0,body_top(x)+.035+h)))
    fins.append(fin_mesh('SiripPunggung1',root,tip,mat))
    # sirip punggung lunak (belakang): lobus bulat menyapu ke belakang
    n=15;xs=[.06-(1.02)*k/(n-1) for k in range(n)]
    root=[Vector((x,0,body_top(x))) for x in xs]
    tip=[]
    for k,x in enumerate(xs):
        q=k/(n-1);h=.10+.26*math.sin(math.pi*(.12+.8*q))**.8
        tip.append(Vector((x-.14-.2*q,0,body_top(x)+.035+h)))
    fins.append(fin_mesh('SiripPunggung2',root,tip,mat))
    # sirip dubur
    n=11;xs=[-.36-(.62)*k/(n-1) for k in range(n)]
    root=[Vector((x,0,body_bot(x))) for x in xs]
    tip=[]
    for k,x in enumerate(xs):
        q=k/(n-1);h=.06+.27*math.sin(math.pi*(.1+.85*q))**.8
        tip.append(Vector((x-.14-.18*q,0,body_bot(x)-.035-h)))
    fins.append(fin_mesh('SiripDubur',root,tip,mat))
    # sirip perut (sepasang), mengarah ke bawah-belakang dan sedikit melebar
    for sd in (1,-1):
        n=7;xs=[.56-.2*k/(n-1) for k in range(n)]
        root=[Vector((x,0,body_bot(x,.05))) for x in xs]
        tip=[]
        for k,x in enumerate(xs):
            q=k/(n-1);r=.30*math.sin(math.pi*(.15+.75*q))**.6
            tip.append(Vector((x-.22-.05*q,0,body_bot(x,.05)-r)))
        f=fin_mesh('SiripPerut_'+('L' if sd>0 else 'R'),root,tip,mat,rows=6,amp=.005,thick=.01)
        f.data.transform(Matrix.Translation((0,0,body_bot(.46,.05)))@Matrix.Rotation(sd*.35,4,'X')@Matrix.Translation((0,0,-body_bot(.46,.05))))
        f.location.y=sd*.07;fins.append(f)
    return fins

def make_tail(mat):
    """Sirip ekor membulat; poros objek di pangkal ekor agar bisa dikibas di Three.js."""
    n=19;x0=XP+.04;zc=(TOP(1)+BOT(1))*.5*0
    root=[];tip=[]
    for k in range(n):
        q=k/(n-1);a=math.radians(-58+116*q)
        root.append(Vector((0,0,(q-.5)*.30)))
        r=.74+.06*math.cos(a*1.6)
        tip.append(Vector((-r*math.cos(a)-.02,0,r*math.sin(a)*.82)))
    ob=fin_mesh('Ekor',root,tip,mat,rows=9,amp=.008,thick=.012)
    ob.location=(x0,0,zc);return ob

def make_pectoral(mat,sd):
    n=9;root=[];tip=[]
    for k in range(n):
        q=k/(n-1);a=math.radians(-50+100*q)
        root.append(Vector((0,0,(q-.5)*.12)))
        r=.34+.04*math.cos(a*2)
        tip.append(Vector((-r*math.cos(a),0,r*math.sin(a)*.75)))
    ob=fin_mesh('SiripDada_'+('L' if sd>0 else 'R'),root,tip,mat,rows=6,amp=.005,thick=.01)
    x=.52;t,b,w=prof(s_of(x))
    ob.location=(x,sd*(w*.86),-.06);ob.rotation_euler=(sd*.25,-.15,sd*-.55)
    return ob

def make_eye(sd,mats):
    x=1.08;t,b,w=prof(s_of(x));r=.112
    bm=bmesh.new();bmesh.ops.create_uvsphere(bm,u_segments=32,v_segments=24,radius=r)
    # kutub bola menghadap keluar agar iris dan pupil jatuh tepat di garis lintang (lingkaran bersih)
    bmesh.ops.rotate(bm,verts=bm.verts,matrix=Matrix.Rotation(-sd*math.pi/2,3,'X'))
    out=Vector((0,sd,0))
    for f in bm.faces:
        f.smooth=True;c=f.calc_center_median().normalized();ang=math.degrees(out.angle(c))
        f.material_index=0 if ang<14 else (1 if ang<45 else 0)
    me=bpy.data.meshes.new('Mata');bm.to_mesh(me);bm.free()
    me.materials.append(mats['eye']);me.materials.append(mats['iris'])
    ob=link(bpy.data.objects.new('Mata_'+('L' if sd>0 else 'R'),me));ob.location=(x,sd*(w*.78),.18);ob.scale=(1,.8,1)
    return ob

# ---------- tekstur (nilai sRGB langsung ke piksel) ----------
ORANGE=np.array([1.0,.40,.04]);ORANGE_D=np.array([.86,.27,.02]);ORANGE_L=np.array([1.0,.58,.18])
WHITE=np.array([.97,.96,.93]);BLACK=np.array([.03,.025,.02])
def body_tex(W=1024,H=512):
    u=(np.arange(W)+.5)/W;v=(np.arange(H)+.5)/H;U,Vv=np.meshgrid(u,v)
    X=XP+U*L;Z=ZMIN+Vv*(ZMAX-ZMIN)
    col=ORANGE[None,None,:]*np.ones((H,W,1))
    g=np.clip((Z+.45)/.95,0,1)[...,None]                      # punggung lebih tua, perut lebih terang
    col=ORANGE_L*(1-g)+ORANGE_D*g
    sc=.035*(np.sin(X*95)*np.sin(Z*95+X*40))[...,None]          # pola sisik halus
    col=col*(1-sc)
    def band(cx,hw,edge=.032):
        d=np.abs(X-cx)
        wm=np.clip((hw-d)/.006+.5,0,1)[...,None]
        bm=np.clip((hw+edge-d)/.006+.5,0,1)[...,None]-wm
        return wm,bm
    bands=[
        (.80+.12*np.clip(1-(Z/.6)**2,0,1),.07),                       # kepala: melengkung ke depan
        (.0+.30*np.clip(1-np.abs(Z-.02)/.5,0,1)**1.6,.085),            # tengah: menonjol ke depan
        (-1.14+.02*np.clip(1-(Z/.3)**2,0,1),.06),                      # pangkal ekor
    ]
    for cx,hw in bands:
        wm,bm=band(cx,hw);col=col*(1-wm-bm)+WHITE*wm+BLACK*bm
    # mulut: garis gelap di ujung moncong bawah
    m=np.clip(1-np.hypot((X-1.48)/.04,(Z+.05)/.012),0,1)[...,None];col=col*(1-m)+BLACK*m
    return np.clip(col,0,1)
def fin_tex(W=256,H=64):
    u=(np.arange(W)+.5)/W;v=(np.arange(H)+.5)/H;U,Vv=np.meshgrid(u,v)
    col=ORANGE*(1-.1*U[...,None])
    ray=(.5+.5*np.cos(Vv*2*np.pi*12))[...,None]*.12*U[...,None];col=col*(1-ray)
    b=np.clip((U-.84)/.04,0,1)[...,None];col=col*(1-b)+BLACK*b
    w=np.clip((U-.95)/.03,0,1)[...,None];col=col*(1-w)+WHITE*w
    return np.clip(col,0,1)
def image(name,arr):
    H,W,_=arr.shape;img=bpy.data.images.new(name,W,H,alpha=False)
    px=np.ones((H,W,4));px[...,:3]=arr;img.pixels.foreach_set(px.astype(np.float32).ravel())
    img.file_format='PNG';img.pack();return img

def tex_mat(name,img,rough,coat=0,two_sided=False):
    m=bpy.data.materials.new(name);m.use_nodes=True;nt=m.node_tree
    bsdf=next(n for n in nt.nodes if n.type=='BSDF_PRINCIPLED')
    tx=nt.nodes.new('ShaderNodeTexImage');tx.image=img;nt.links.new(tx.outputs['Color'],bsdf.inputs['Base Color'])
    bsdf.inputs['Roughness'].default_value=rough
    if coat and 'Coat Weight' in bsdf.inputs:bsdf.inputs['Coat Weight'].default_value=coat
    m.use_backface_culling=not two_sided;return m
def plain_mat(name,rgb,rough,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    bsdf=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    bsdf.inputs['Base Color'].default_value=(*rgb,1);bsdf.inputs['Roughness'].default_value=rough;bsdf.inputs['Metallic'].default_value=metal
    return m

def build():
    M={'body':tex_mat('Badan',image('badut_badan',body_tex()),.35,coat=.6),
       'fin':tex_mat('Sirip',image('badut_sirip',fin_tex()),.5,two_sided=True),
       'eye':plain_mat('Mata',(.005,.005,.006),.05),
       'iris':plain_mat('Iris',(.9,.45,.05),.25)}
    root=link(bpy.data.objects.new('IkanBadut',None))
    body=make_body(M['body']);body.parent=root
    for f in make_fins(M['fin']):f.parent=root
    make_tail(M['fin']).parent=root
    for sd in (1,-1):make_pectoral(M['fin'],sd).parent=root;make_eye(sd,M).parent=root
    return root

if __name__=='__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    root=build()
    for o in bpy.data.objects:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'clownfish.glb'),export_format='GLB',export_yup=True,export_apply=True,use_selection=True,export_image_format='JPEG',export_jpeg_quality=88)
    print('selesai')
