"""Sepatu KAZE (Air Kaze 02) untuk web.
  blender -b -P blender/kaze_sneaker.py          keluaran: blender/out/sneaker.glb
Sumbu dan satuan sama dengan sepatu prosedural lama di js/concepts/kaze.js: X panjang (ujung jari di +X, tumit -1.15,
ujung 1.35), Z atas (alas di 0), Y lebar. Semua bagian dibangun dari satu jejak kaki (outline) dan satu fungsi permukaan
upper, jadi overlay (toe cap, heel counter, garis angin), eyestay, mata tali, dan tali menempel tepat di permukaannya.
Bahan bernama untuk diganti di Three.js: Upper, Aksen, Sol, Midsole, Tali, Logam, Dalam."""
import bpy,bmesh,math,os
import numpy as np
from mathutils import Vector,Matrix
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'out');os.makedirs(OUT,exist_ok=True)

def pchip(keys):
    xs=np.array([k[0] for k in keys],float);ys=np.array([k[1] for k in keys],float)
    h=np.diff(xs);d=np.diff(ys)/h;m=np.zeros_like(ys);m[0]=d[0];m[-1]=d[-1]
    for i in range(1,len(ys)-1):
        m[i]=0 if d[i-1]*d[i]<=0 else 3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/d[i-1]+(h[i]+2*h[i-1])/d[i])
    def f(x):
        x=min(max(x,xs[0]),xs[-1]);i=min(np.searchsorted(xs,x,side='right')-1,len(h)-1);t=(x-xs[i])/h[i]
        return float((2*t**3-3*t**2+1)*ys[i]+(t**3-2*t**2+t)*h[i]*m[i]+(-2*t**3+3*t**2)*ys[i+1]+(t**3-t**2)*h[i]*m[i+1])
    return f
def sstep(a,b,x):t=min(max((x-a)/(b-a),0),1);return t*t*(3-2*t)

# ---------- jejak kaki dan sol ----------
XH,XT=-1.15,1.35
WK=pchip([(-.95,.30),(-.75,.345),(-.45,.33),(-.15,.335),(.2,.385),(.55,.425),(.85,.41),(1.05,.35),(1.12,.31)])
def wf(x):
    """setengah lebar jejak; ujung tumit dan jari membulat (seperempat elips)"""
    if x<=XH or x>=XT:return 0.0
    if x<XH+.2:d=(x-XH)/.2;return WK(-.95)*math.sqrt(max(0,1-(1-d)**2))
    if x>XT-.23:d=(XT-x)/.23;return WK(1.12)*math.sqrt(max(0,1-(1-d)**2))
    return WK(x)
def zb(x):return .10*sstep(.55,1.35,x)**1.4+.035*sstep(-.95,-1.15,x)       # toe spring + tumit miring
TH=pchip([(-1.15,.27),(-.6,.28),(0,.24),(.6,.19),(1.0,.165),(1.35,.15)])
def zt(x):return zb(x)+TH(x)
OS=.035  # tebal outsole

def xs_cos(n,a=XH,b=XT):return [a+(b-a)*(1-math.cos(math.pi*i/n))/2 for i in range(n+1)]

def outline(n=90):
    xs=xs_cos(n);P=[(x,wf(x)) for x in xs]+[(x,-wf(x)) for x in reversed(xs[1:-1])]
    return P
def normals2d(P):
    N=[]
    for i in range(len(P)):
        a=P[i-1];b=P[(i+1)%len(P)];t=Vector((b[0]-a[0],b[1]-a[1])).normalized();N.append(Vector((t.y,-t.x)))
    # pastikan mengarah keluar
    c=Vector((sum(p[0] for p in P)/len(P),0))
    return [n if n.dot(Vector(p)-c)>0 else -n for n,p in zip(N,P)]

def link(ob,parent=None):
    bpy.context.collection.objects.link(ob)
    if parent:ob.parent=parent
    return ob
def mesh_obj(name,bm,mats):
    me=bpy.data.meshes.new(name);bm.to_mesh(me);bm.free()
    for m in mats:me.materials.append(m)
    return link(bpy.data.objects.new(name,me))

def loft_sole(name,levels,zfun,mat,grow=0.0):
    """levels: (t, inset) dari bawah ke atas; t memetakan zb..zt lewat zfun(x,t)."""
    P=outline();N=normals2d(P);bm=bmesh.new();uv=bm.loops.layers.uv.new('UVMap');rings=[]
    per=[0.0]
    for i in range(1,len(P)):per.append(per[-1]+math.dist(P[i],P[i-1]))
    for t,ins in levels:
        rings.append([bm.verts.new((p[0]+n.x*(grow-ins),p[1]+n.y*(grow-ins),zfun(p[0],t))) for p,n in zip(P,N)])
    M=len(P)
    for k in range(len(rings)-1):
        for i in range(M):
            f=bm.faces.new((rings[k][i],rings[k][(i+1)%M],rings[k+1][(i+1)%M],rings[k+1][i]));f.smooth=True
            for l,(ii,kk) in zip(f.loops,((i,k),((i+1)%M,k),((i+1)%M,k+1),(i,k+1))):l[uv].uv=(per[ii]/3.0,kk/(len(rings)-1))
    for ring,flip in((rings[0],True),(rings[-1],False)):
        c=bm.verts.new((sum(v.co.x for v in ring)/M,0,sum(v.co.z for v in ring)/M))
        for i in range(M):
            f=bm.faces.new((c,ring[(i+1)%M],ring[i]) if not flip else (c,ring[i],ring[(i+1)%M]));f.smooth=True
            for l in f.loops:l[uv].uv=((l.vert.co.x-XH)/2.5,l.vert.co.y+.5)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    return mesh_obj(name,bm,[mat])

def make_sole(M):
    out=loft_sole('Outsole',[(0,.025),(.15,.006),(.4,0),(1,0)],lambda x,t:zb(x)+t*OS,M['sol'],grow=.006)
    mid=loft_sole('Midsole',[(0,0),(.08,-.004),(.5,-.006),(.85,0),(.95,.008),(1,.022)],lambda x,t:zb(x)+OS+t*(zt(x)-zb(x)-OS),M['mid'])
    # alur horizontal di dinding midsole
    P=outline(70);N=normals2d(P)
    pts=[Vector((p[0]+n.x*.003,p[1]+n.y*.003,zb(p[0])+OS+.42*(zt(p[0])-zb(p[0])-OS))) for p,n in zip(P,N)]
    g=tube('Alur',pts,.009,M['dalam'],cyclic=True,res=1)
    # tapak: lug bervelg mengikuti toe spring
    bm=bmesh.new()
    for x in np.arange(-1.02,1.24,.105):
        w=wf(x)-.06
        for y in np.arange(-.36,.37,.095):
            if abs(y)>w:continue
            sx,sy=.068,.072 if abs(y)<.2 else .06
            r=bmesh.ops.create_cube(bm,size=1)['verts']
            ang=math.atan2(zb(x+.01)-zb(x-.01),.02)
            bmesh.ops.scale(bm,vec=(sx,sy,.022),verts=r)
            bmesh.ops.rotate(bm,verts=r,matrix=Matrix.Rotation(-ang,3,'Y'))
            bmesh.ops.translate(bm,verts=r,vec=(x+(.02 if int(round(y/.095))%2 else -.02),y,zb(x)-.006))
    lug=mesh_obj('Tapak',bm,[M['sol']])
    return [out,mid,g,lug]

def tube(name,pts,r,mat,cyclic=False,res=2):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.bevel_depth=r;cu.bevel_resolution=res;cu.fill_mode='FULL';cu.use_fill_caps=not cyclic
    sp=cu.splines.new('POLY');sp.points.add(len(pts)-1)
    for p,v in zip(sp.points,pts):p.co=(v.x,v.y,v.z,1)
    sp.use_cyclic_u=cyclic
    ob=link(bpy.data.objects.new(name,cu));cu.materials.append(mat)
    me=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    m=link(bpy.data.objects.new(name,me));bpy.data.objects.remove(ob)
    for p in me.polygons:p.use_smooth=True
    return m

def torus(name,R,r,mat,nu=20,nv=8):
    bm=bmesh.new();V=[[bm.verts.new(((R+r*math.cos(b))*math.cos(a),(R+r*math.cos(b))*math.sin(a),r*math.sin(b)))
        for b in np.linspace(0,2*math.pi,nv,endpoint=False)] for a in np.linspace(0,2*math.pi,nu,endpoint=False)]
    for i in range(nu):
        for j in range(nv):bm.faces.new((V[i][j],V[(i+1)%nu][j],V[(i+1)%nu][(j+1)%nv],V[i][(j+1)%nv])).smooth=True
    return mesh_obj(name,bm,[mat])

# ---------- permukaan upper ----------
HU=pchip([(-1.15,.50),(-1.0,.56),(-.7,.55),(-.4,.52),(-.15,.47),(.15,.40),(.45,.32),(.75,.25),(1.0,.19),(1.2,.14),(1.35,.09)])
P_EXP=.6
def S(x,th,off=0.0):
    """titik permukaan upper di stasiun x, sudut th (0 = sisi lateral bawah, pi/2 = punggung kaki, pi = sisi medial bawah)"""
    W=max(wf(x)-.025,0)+off*(1 if wf(x)>.03 else 0);z0=zt(x)-.03;H=HU(x)+off
    c,s=math.cos(th),math.sin(th)
    p=Vector((x,W*c*(1+.08*s),z0+H*abs(s)**P_EXP))
    if off==0:return p
    return p+Sn(x,th)*off
def Sn(x,th):
    """normal luar permukaan upper (beda hingga), dengan acuan arah dari sumbu dalam sepatu"""
    e=1e-3;p=S(x,th)
    dx=S(min(x+e,XT),th)-S(max(x-e,XH),th);dt=S(x,th+e)-S(x,th-e)
    n=dx.cross(dt);ref=p-Vector((min(max(x,-.85),1.0),0,zt(x)+.08))
    if n.length<1e-9:n=ref
    n.normalize()
    return n if n.dot(ref)>=0 else -n
# bukaan kerah (elips di denah)
XC,AX,BY=-.6,.43,.215
def yo(x):q=(x-XC)/AX;return BY*math.sqrt(max(0,1-q*q)) if abs(q)<1 else 0.0
def th_open(x):
    W=max(wf(x)-.025,1e-4);y=yo(x)
    return math.acos(min(1,y/W)) if y>0 else math.pi/2

def make_upper(M):
    N,K=64,14
    xs=xs_cos(N);bm=bmesh.new();uv=bm.loops.layers.uv.new('UVMap')
    halves=[]
    for side in(1,-1):
        G=[]
        for x in xs:
            tm=th_open(x);row=[]
            for k in range(K+1):
                th=tm*k/K
                if side<0:th=math.pi-th
                row.append(bm.verts.new(S(x,th)))
            G.append(row)
        halves.append(G)
        for i in range(N):
            for k in range(K):
                q=(G[i][k],G[i+1][k],G[i+1][k+1],G[i][k+1])
                f=bm.faces.new(q if side>0 else q[::-1]);f.smooth=True
                for l in f.loops:l[uv].uv=((l.vert.co.x-XH)/2.5,l.vert.co.z)
    bmesh.ops.remove_doubles(bm,verts=bm.verts[:],dist=1e-5)
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    up=mesh_obj('Upper',bm,[M['upper'],M['dalam']])
    so=up.modifiers.new('tebal','SOLIDIFY');so.thickness=.022;so.offset=-1;so.material_offset=1;so.material_offset_rim=1
    return up

def overlay(name,xa,xb,tha,thb,mat,nx=16,nt=12,off=.007,thick=.008):
    """panel yang menempel pada upper: grid di ruang (x, th) dinaikkan sejauh off"""
    bm=bmesh.new();G=[]
    for i in range(nx+1):
        x=xa+(xb-xa)*i/nx;G.append([bm.verts.new(S(x,tha(x)+(thb(x)-tha(x))*k/nt,off)) for k in range(nt+1)])
    for i in range(nx):
        for k in range(nt):bm.faces.new((G[i][k],G[i+1][k],G[i+1][k+1],G[i][k+1])).smooth=True
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:])
    ob=mesh_obj(name,bm,[mat]);so=ob.modifiers.new('tebal','SOLIDIFY');so.thickness=thick;so.offset=-1
    return ob
def th_at_z(x,dz):
    H=HU(x);s=min(1,max(0,dz/H))**(1/P_EXP);return math.asin(min(1,s))

def make_overlays(M):
    A=M['aksen'];obs=[]
    # toe cap: menutup ujung depan dari sisi ke sisi
    obs.append(overlay('ToeCap',.98,XT,lambda x:0.0,lambda x:math.pi,A,nx=10,nt=22))
    # heel counter: bagian bawah tumit sampai 0.3 di atas midsole
    for sd in(1,-1):
        hc=lambda x:.06+.27*sstep(-.78,-1.1,x)   # tepi atas melengkung: tinggi di tumit, landai ke depan
        f=(lambda x:0.0) if sd>0 else (lambda x:math.pi-th_at_z(x,hc(x)))
        g=(lambda x:th_at_z(x,hc(x))) if sd>0 else (lambda x:math.pi)
        obs.append(overlay('HeelCounter_'+str(sd),XH,-.78,f,g,A,nx=16,nt=8))
    # garis angin: diagonal dari depan bawah ke belakang atas, meruncing
    for sd in(1,-1):
        def zc(x):return .07+.24*sstep(.72,-.75,x)
        def hw(x):return .018+.03*sstep(.72,-.75,x)
        lo=lambda x,sd=sd:(th_at_z(x,zc(x)-hw(x)) if sd>0 else math.pi-th_at_z(x,zc(x)+hw(x)))
        hi=lambda x,sd=sd:(th_at_z(x,zc(x)+hw(x)) if sd>0 else math.pi-th_at_z(x,zc(x)-hw(x)))
        obs.append(overlay('GarisAngin_'+str(sd),-.75,.72,lo,hi,A,nx=40,nt=3))
    return obs

def make_lacing(M):
    obs=[];XS=[.38,.26,.14,.02,-.1]
    # eyestay: pita di kiri-kanan area tali
    for sd in(1,-1):
        def lo(x,sd=sd):
            W=max(wf(x)-.025,1e-3);a=math.acos(min(1,.215/W));b=math.acos(min(1,.125/W))
            return a if sd>0 else math.pi-b
        def hi(x,sd=sd):
            W=max(wf(x)-.025,1e-3);a=math.acos(min(1,.215/W));b=math.acos(min(1,.125/W))
            return b if sd>0 else math.pi-a
        obs.append(overlay('Eyestay_'+str(sd),-.16,.45,lo,hi,M['aksen'],nx=20,nt=3,off=.009,thick=.01))
    # lidah: menempel di punggung kaki lalu naik keluar dari bukaan kerah
    bm=bmesh.new();G=[];NX,NY=16,8
    for i in range(NX+1):
        x=.42-(.42+.36)*i/NX;row=[]
        for j in range(NY+1):
            y=-.14+.28*j/NY;W=max(wf(x)-.025,1e-3);c=max(-1,min(1,y/W));th=math.acos(c)
            p=S(x,th,.002);lift=max(0,-.12-x);p.z+=lift*.55+.012;p.x+=-lift*.15
            row.append(bm.verts.new(p))
        G.append(row)
    for i in range(NX):
        for j in range(NY):bm.faces.new((G[i][j],G[i+1][j],G[i+1][j+1],G[i][j+1])).smooth=True
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces[:]);top=G[-1][NY//2].co.copy()
    tg=mesh_obj('Lidah',bm,[M['upper']]);so=tg.modifiers.new('tebal','SOLIDIFY');so.thickness=.03;so.offset=-1
    sub=tg.modifiers.new('halus','SUBSURF');sub.levels=1;sub.render_levels=1;obs.append(tg)
    # label lidah
    bm=bmesh.new();r=bmesh.ops.create_cube(bm,size=1)['verts'];bmesh.ops.scale(bm,vec=(.012,.12,.07),verts=r)
    bmesh.ops.rotate(bm,verts=r,matrix=Matrix.Rotation(-.55,3,'Y'));bmesh.ops.translate(bm,verts=r,vec=top+Vector((.02,0,-.03)))
    lb=mesh_obj('LabelLidah',bm,[M['aksen']]);b=lb.modifiers.new('bevel','BEVEL');b.width=.004;b.segments=2;obs.append(lb)
    # mata tali + tali bersilang
    eye={}
    for sd in(1,-1):
        for i,x in enumerate(XS):
            W=max(wf(x)-.025,1e-3);th=math.acos(min(1,.17/W));th=th if sd>0 else math.pi-th
            p=S(x,th,.018);n=(S(x,th,.05)-S(x,th,0)).normalized();eye[(sd,i)]=(p,n)
            o=torus('MataTali',.02,.0065,M['logam']);o.location=p;o.rotation_euler=n.to_track_quat('Z','Y').to_euler();obs.append(o)
    def lace(a,b,lift=.018):
        pa,na=a;pb,nb=b;m=(pa+pb)/2;up=((na+nb)/2).normalized()
        pts=[pa,pa.lerp(m,.5)+up*lift*.8,m+up*lift,pb.lerp(m,.5)+up*lift*.8,pb]
        return tube('Tali',pts,.011,M['tali'])
    obs.append(lace(eye[(1,0)],eye[(-1,0)],.012))
    for i in range(len(XS)-1):
        obs.append(lace(eye[(1,i)],eye[(-1,i+1)]));obs.append(lace(eye[(-1,i)],eye[(1,i+1)],.026))
    # simpul dan ujung tali di atas
    p1,n1=eye[(1,len(XS)-1)];p2,n2=eye[(-1,len(XS)-1)];c=(p1+p2)/2+Vector((0,0,.03))
    for sd,p in((1,p1),(-1,p2)):
        obs.append(tube('Tali',[p,c+Vector((0,sd*.02,0)),c+Vector((-.09,sd*.1,.04)),c+Vector((-.03,sd*.13,0)),c],.011,M['tali']))
        obs.append(tube('Tali',[c,c+Vector((.06,sd*.09,-.02)),c+Vector((.12,sd*.17,-.11)),c+Vector((.14,sd*.2,-.2))],.01,M['tali']))
    return obs

def make_collar(M):
    """bantalan kerah mengikuti tepi bukaan; tab tarik di tumit"""
    xs=[XC+AX*math.cos(a) for a in np.linspace(0,math.pi,40)]
    lat=[S(x,th_open(x),.012) for x in xs];med=[S(x,math.pi-th_open(x),.012) for x in reversed(xs[1:-1])]
    pts=lat+med
    col=tube('Kerah',pts,.034,M['aksen'],cyclic=True)
    back=S(XC-AX+.004,math.pi/2,.0)
    bm=bmesh.new();r=bmesh.ops.create_cube(bm,size=1)['verts'];bmesh.ops.scale(bm,vec=(.035,.11,.2),verts=r)
    bmesh.ops.rotate(bm,verts=r,matrix=Matrix.Rotation(.2,3,'Y'));bmesh.ops.translate(bm,verts=r,vec=back+Vector((-.035,0,.02)))
    tab=mesh_obj('TabTumit',bm,[M['aksen']]);b=tab.modifiers.new('bevel','BEVEL');b.width=.012;b.segments=3
    return [col,tab]

def mat(name,rgb,rough,metal=0):
    m=bpy.data.materials.new(name);m.use_nodes=True
    b=next(n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
    b.inputs['Base Color'].default_value=(*rgb,1);b.inputs['Roughness'].default_value=rough;b.inputs['Metallic'].default_value=metal
    return m

def build():
    M={'upper':mat('Upper',(.02,.02,.03),.8),'aksen':mat('Aksen',(0,.75,1),.35),'sol':mat('Sol',(.7,.7,.72),.8),
       'mid':mat('Midsole',(.9,.9,.88),.7),'tali':mat('Tali',(.95,.95,.95),.9),'logam':mat('Logam',(.8,.82,.85),.3,1),'dalam':mat('Dalam',(.02,.02,.025),.9)}
    root=link(bpy.data.objects.new('SepatuKaze',None))
    for o in make_sole(M)+[make_upper(M)]+make_overlays(M)+make_lacing(M)+make_collar(M):o.parent=root
    return root

if __name__=='__main__':
    bpy.ops.wm.read_factory_settings(use_empty=True)
    build()
    for o in bpy.data.objects:o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'sneaker.glb'),export_format='GLB',export_yup=True,export_apply=True,use_selection=True)
    print('selesai')
