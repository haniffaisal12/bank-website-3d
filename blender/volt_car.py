"""VOLT X1 (SUV listrik) — model mobil dengan detail setingkat aset referensi (lihat STUDI_CHANDELIER.md).
  python volt_car.py render|glb|both [--fast]
Pelajaran yang dipakai: siluet dipahat (bukan primitif), normal terbobot + sisi tajam ber-bevel, bagian berulang,
kaca dan lampu sebagai bahan tersendiri, celah panel nyata, ban dengan tapak, velg berlapis."""
import bpy,bmesh,math,sys,os
from mathutils import Vector,Matrix
from mathutils.bvhtree import BVHTree
HERE=os.path.dirname(os.path.abspath(__file__));OUT=os.path.join(HERE,'out');os.makedirs(OUT,exist_ok=True)
MODE=next((a for a in sys.argv[1:] if a in('render','glb','both')),'both');FAST='--fast' in sys.argv
def lin(c):
    f=lambda u:u/12.92 if u<=.04045 else((u+.055)/1.055)**2.4
    return (f((c>>16&255)/255),f((c>>8&255)/255),f((c&255)/255),1)
def mat(name,color,metal=0,rough=.5,emit=None,es=0,coat=0,coatr=.05,trans=0,ior=1.45,alpha=1):
    m=bpy.data.materials.new(name);m.use_nodes=True;b=m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value=color;b.inputs['Metallic'].default_value=metal;b.inputs['Roughness'].default_value=rough
    b.inputs['Coat Weight'].default_value=coat;b.inputs['Coat Roughness'].default_value=coatr;b.inputs['IOR'].default_value=ior
    if trans:b.inputs['Transmission Weight'].default_value=trans
    if alpha<1:b.inputs['Alpha'].default_value=alpha
    if emit:b.inputs['Emission Color'].default_value=emit;b.inputs['Emission Strength'].default_value=es
    return m
def smoothstep(a,b,x):
    t=max(0,min(1,(x-a)/(b-a)));return t*t*(3-2*t)
def herm(keys,x):
    if x<=keys[0][0]:return keys[0][1]
    for a,b in zip(keys,keys[1:]):
        if x<=b[0]:
            t=(x-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t*t*(3-2*t)
    return keys[-1][1]
def spline(keys,x):
    # Catmull-Rom halus antar kunci
    n=len(keys)
    for i in range(n-1):
        if x<=keys[i+1][0] or i==n-2:
            p0=keys[max(i-1,0)];p1=keys[i];p2=keys[i+1];p3=keys[min(i+2,n-1)]
            t=(x-p1[0])/(p2[0]-p1[0]);t=max(0,min(1,t))
            return .5*((2*p1[1])+(-p0[1]+p2[1])*t+(2*p0[1]-5*p1[1]+4*p2[1]-p3[1])*t*t+(-p0[1]+3*p1[1]-3*p2[1]+p3[1])*t**3)
def link(ob,parent=None):
    if ob.name not in bpy.context.collection.objects:bpy.context.collection.objects.link(ob)
    if parent:ob.parent=parent
    return ob
def smooth(ob):
    for p in ob.data.polygons:p.use_smooth=True
def bevel_wn(ob,width=.006,seg=2,angle=40):
    b=ob.modifiers.new('bevel','BEVEL');b.width=width;b.segments=seg;b.limit_method='ANGLE';b.angle_limit=math.radians(angle);b.harden_normals=True
    w=ob.modifiers.new('wn','WEIGHTED_NORMAL');w.keep_sharp=True
    if hasattr(ob.data,'use_auto_smooth'):ob.data.use_auto_smooth=True

def RBox(w,h,d,r,material,loc):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=(w,h,d)
    o.data.materials.append(material)
    b=o.modifiers.new('bev','BEVEL');b.width=r;b.segments=3;b.limit_method='NONE'
    smooth(o);return o

# ================= bodi =================
XF,XR=2.45,-2.45
# Proporsi diturunkan dari model SUV besar sebagai acuan (kap pendek dan tinggi, kabin panjang, atap datar),
# lalu diubah: hidung tertutup tanpa gril, atap meluncur ke belakang (fastback), garis pinggang naik ke belakang.
TOP=[(XR,1.16),(-2.38,1.20),(-2.15,1.28),(-1.75,1.42),(-1.2,1.58),(-.7,1.70),(-.2,1.74),(.3,1.72),(.62,1.64),(.9,1.48),(1.12,1.33),(1.4,1.25),(1.8,1.20),(2.2,1.14),(2.4,1.04),(XF,.90)]
BOT=[(XR,.56),(-2.3,.42),(-1.95,.34),(1.95,.34),(2.3,.36),(XF,.48)]
WID=[(XR,.78),(-2.2,.88),(-1.7,.95),(-1.0,.965),(0,.945),(1.0,.955),(1.7,.965),(2.2,.90),(XF,.76)]
BELT=lambda x:1.16+.05*smoothstep(1.2,-2.2,x)
def cabin_mask(x):return smoothstep(-2.3,-1.9,x)*(1-smoothstep(.55,1.15,x))
N1,N2,N3=16,12,8            # jumlah segmen: badan bawah, jendela, atap
K=N1+N2+N3
def sv_lohi(x):
    t=spline(TOP,x);bt=spline(BOT,x);h=t-bt
    return (BELT(x)+.012-bt)/h,(t-bt-.10)/h
def svs_for(x):
    lo,hi=sv_lohi(x);lo=max(.35,min(.7,lo));hi=max(lo+.1,min(.97,hi))
    a=[lo*(i/N1)**1.0 for i in range(N1)]
    b=[lo+(hi-lo)*(i/N2) for i in range(N2)]
    c=[hi+(1-hi)*(i/N3) for i in range(N3+1)]
    return a+b+c
def pt_at(x,sv,side):
    t=spline(TOP,x);b=spline(BOT,x);w=spline(WID,x);cm=cabin_mask(x)
    sn=2*sv-1;c=side*math.sqrt(max(0,1-sn*sn))
    if sv<.5:wf=1-.085*(1-sv/.5)**2
    else:
        k=(sv-.5)/.5;wf=1-(.36*cm+.16*(1-cm))*k**1.8
    e=2/(3.6+.5*cm)
    return (w*wf*math.copysign(abs(c)**e,c) if c!=0 else 0.0, b+(t-b)*sv)
def body_ring(x):
    svs=svs_for(x)
    right=[pt_at(x,sv,1) for sv in svs]
    left=[pt_at(x,sv,-1) for sv in reversed(svs[1:-1])]
    return right+left
def make_body():
    N=200;M=2*K;me=bpy.data.meshes.new('Bodi');bm=bmesh.new();rows=[]
    for i in range(N+1):
        x=XR+(XF-XR)*i/N;pts=body_ring(x)
        rows.append([bm.verts.new((x,y,z)) for (y,z) in pts])
    mats=[]
    for i in range(N):
        xm=XR+(XF-XR)*(i+.5)/N
        for j in range(M):
            f=bm.faces.new((rows[i][j],rows[i][(j+1)%M],rows[i+1][(j+1)%M],rows[i+1][j]))
            seg=j if j<K else (2*K-1-j)         # indeks segmen ketinggian (0..K-1) di sisi kiri/kanan
            g=False
            g=False
            if .36<xm<1.14 and seg>=N1:g=True
            if -2.05<xm<-1.62 and seg>=N1+N2:g=True
            if -1.9<=xm<=.36 and N1<=seg<N1+N2 and not(-.62<xm<-.5) and not(.02<xm<.12):g=True
            if -1.45<xm<.12 and seg>=N1+N2+3:g=True
            f.material_index=1 if g else 0
    for end in(0,N):
        vs=rows[end];c=sum((v.co for v in vs),Vector())/len(vs);cv=bm.verts.new(c)
        for j in range(M):
            f=bm.faces.new((cv,vs[(j+1)%M],vs[j]) if end==0 else (cv,vs[j],vs[(j+1)%M]));f.material_index=0
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    bm.to_mesh(me);bm.free()
    ob=link(bpy.data.objects.new('Bodi',me));smooth(ob)
    return ob

# ================= roda =================
WB=1.48;WR=.42;TRACK=.93;RS=1.3
def make_tire():
    NT=120;NP=40;me=bpy.data.meshes.new('Ban');bm=bmesh.new();rows=[]
    W=.29;Rr=.26   # lebar, jari-jari velg
    for i in range(NT):
        th=i/NT*math.tau;groove=1 if(int(i/NT*46)%2==0) else 0;row=[]
        for j in range(NP):
            ph=j/NP*math.tau;c=math.cos(ph);s=math.sin(ph)
            # penampang: sisi bulat dengan bahu; tapak di ph~0
            y=(W/2)*math.copysign(abs(s)**.8,s)          # lebar (sumbu roda)
            r=Rr+(WR-Rr)*(.5+.5*math.copysign(abs(c)**.6,c))
            if c>.55 and abs(s)<.72:r-=.0035*groove*smoothstep(.55,.7,c)  # alur tapak
            if abs(s)>.97 and c<.5:r=Rr+(WR-Rr)*.5*(1+c)+.0     # sisi dalam
            row.append(bm.verts.new((math.cos(th)*r,y,math.sin(th)*r)))
        rows.append(row)
    for i in range(NT):
        for j in range(NP):
            bm.faces.new((rows[i][j],rows[i][(j+1)%NP],rows[(i+1)%NT][(j+1)%NP],rows[(i+1)%NT][j]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
    ob=link(bpy.data.objects.new('Ban',me));smooth(ob);return ob
def lathe(name,prof,seg=64):
    me=bpy.data.meshes.new(name);bm=bmesh.new();rows=[]
    for i in range(seg):
        th=i/seg*math.tau;rows.append([bm.verts.new((math.cos(th)*r,y,math.sin(th)*r)) for (r,y) in prof])
    for i in range(seg):
        for j in range(len(prof)-1):
            bm.faces.new((rows[i][j],rows[i][j+1],rows[(i+1)%seg][j+1],rows[(i+1)%seg][j]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
    ob=link(bpy.data.objects.new(name,me));smooth(ob);return ob
def poly_extrude(name,pts2d,depth,y0):
    me=bpy.data.meshes.new(name);bm=bmesh.new()
    v0=[bm.verts.new((x,y0,z)) for x,z in pts2d];v1=[bm.verts.new((x,y0+depth,z)) for x,z in pts2d]
    bm.faces.new(v0[::-1]);bm.faces.new(v1)
    n=len(v0)
    for i in range(n):bm.faces.new((v0[i],v0[(i+1)%n],v1[(i+1)%n],v1[i]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces);bm.to_mesh(me);bm.free()
    return link(bpy.data.objects.new(name,me))
def rim_sport():
    parts=[]
    barrel=lathe('VelgLaras',[(.185,-.12),(.19,-.10),(.19,-.02),(.178,0),(.178,.06),(.19,.085),(.22,.1),(.222,.115),(.20,.12),(.185,.11)],72)
    parts.append(barrel)
    # 10 jari-jari ganda
    for k in range(10):
        a=k*math.tau/10;w0=.020
        prof=[(.05,-w0),(.19,-w0*1.3),(.19,w0*1.3),(.05,w0)]
        pts=[(r*math.cos(a)-yy*math.sin(a)*1,r*math.sin(a)+yy*math.cos(a)) for (r,yy) in prof]
        sp=poly_extrude('Jari%d'%k,pts,.045,.04);bevel_wn(sp,.004,2,30);parts.append(sp)
    hub=lathe('Hub',[(.001,.04),(.06,.04),(.066,.07),(.05,.085),(.001,.09)],32);parts.append(hub)
    return parts
def rim_aero():
    parts=[]
    barrel=lathe('VelgAeroBarrel',[(.185,-.12),(.19,-.10),(.19,-.02),(.178,0),(.178,.06),(.19,.085),(.22,.1),(.222,.115),(.20,.12),(.185,.11)],72);parts.append(barrel)
    # cakram dengan 5 celah aerodinamis (dibuat dari 5 bilah lebar)
    for k in range(5):
        a=k*math.tau/5;prof=[]
        for t in range(0,13):
            u=t/12;r0=.05+(.185-.05)*u;wid=(.31-.1*u)*.5;prof.append((r0,wid))
        up=[(r*math.cos(a+w)-0,r*math.sin(a+w)) for r,w in prof];dn=[(r*math.cos(a-w),r*math.sin(a-w)) for r,w in prof[::-1]]
        # bilah = wedge antar dua kurva sudut
        pts=[(r*math.cos(a+w),r*math.sin(a+w)) for r,w in prof]+[(r*math.cos(a-w),r*math.sin(a-w)) for r,w in prof[::-1]]
        pts=[(p[0],p[1]) for p in pts]
        bl=poly_extrude('Bilah%d'%k,pts,.03,.05);bevel_wn(bl,.003,2,30);parts.append(bl)
    cap=lathe('CapAero',[(.001,.04),(.06,.045),(.07,.07),(.001,.08)],32);parts.append(cap)
    return parts
def make_wheel_set(mats):
    tire=make_tire();tire.data.materials.append(mats['rubber'])
    disc=lathe('Cakram',[(.04,-.03),(.15,-.03),(.155,-.055),(.16,-.075),(.09,-.075),(.09,-.06),(.04,-.06)],64);disc.data.materials.append(mats['brake'])
    cal=poly_extrude('Kaliper',[(-.11,.11),(.11,.11),(.14,.03),(.14,-.03),(.11,-.11),(-.11,-.11)] if False else [(.03,.10),(.16,.07),(.17,-.05),(.14,-.13),(.03,-.10)],.07,-.10);cal.data.materials.append(mats['caliper']);bevel_wn(cal,.008,3,30)
    sport=rim_sport();aero=rim_aero()
    for p in sport+aero:p.data.materials.append(mats['rim'])
    # nut
    nuts=[]
    for k in range(5):
        a=k*math.tau/5;n=lathe('Baut',[(.001,.09),(.012,.09),(.012,.1),(.001,.1)],6);n.location=(math.cos(a)*.08,0,math.sin(a)*.08);n.data.materials.append(mats['chrome']);nuts.append(n)
    return dict(tire=tire,disc=disc,cal=cal,sport=sport,aero=aero,nuts=nuts)

# ================= detail bodi =================
def boolean_diff(ob,cutter,exact=False):
    m=ob.modifiers.new('cut','BOOLEAN');m.operation='DIFFERENCE';m.object=cutter;m.solver='EXACT'
    bpy.context.view_layer.objects.active=ob
    bpy.ops.object.select_all(action='DESELECT');ob.select_set(True)
    bpy.ops.object.modifier_apply(modifier='cut')
def cyl_obj(name,r,depth,loc,axis='Y'):
    bpy.ops.mesh.primitive_cylinder_add(radius=r,depth=depth,vertices=96,location=loc,rotation=(math.pi/2,0,0) if axis=='Y' else (0,0,0))
    o=bpy.context.object;o.name=name;return o
def project_line(bvh,pts,side=1,off=.0015):
    """titik (x,z) diproyeksikan ke permukaan bodi sepanjang sumbu Y; kembalikan daftar Vector di permukaan."""
    out=[]
    for (x,z) in pts:
        o=Vector((x,side*3,z));d=Vector((0,-side,0))
        hit=bvh.ray_cast(o,d)
        if hit[0] is not None:out.append(hit[0]+hit[1]*off)
    return out
def tube(name,pts,r,material,cyclic=False):
    cu=bpy.data.curves.new(name,'CURVE');cu.dimensions='3D';cu.bevel_depth=r;cu.bevel_resolution=2;cu.fill_mode='FULL'
    sp=cu.splines.new('POLY');sp.points.add(len(pts)-1)
    for p,v in zip(sp.points,pts):p.co=(v.x,v.y,v.z,1)
    sp.use_cyclic_u=cyclic
    ob=bpy.data.objects.new(name,cu);link(ob);ob.data.materials.append(material);return ob
def to_mesh(ob):
    me=bpy.data.meshes.new_from_object(ob.evaluated_get(bpy.context.evaluated_depsgraph_get()))
    m=bpy.data.objects.new(ob.name,me);link(m);bpy.data.objects.remove(ob);return m

def make_mirror(side,c,M,root):
    # rumah spion tetes air: depan membulat, belakang rata berkaca krom, ujung luar menyapu ke belakang
    bm=bmesh.new();bmesh.ops.create_cube(bm,size=1.0)
    for _ in range(3):bmesh.ops.subdivide_edges(bm,edges=bm.edges[:],cuts=1,use_grid_fill=True)
    for v in bm.verts:
        x,y,z=v.co;r=(abs(x)**4+abs(y)**4+abs(z)**4)**.25 or 1
        x,y,z=Vector((x,y,z))/r*.5
        x*=2*(.075 if x>0 else .028)
        taper=1-.18*max(0,x)/.075
        y*=2*.105*taper;z*=2*.05*taper*(1 if z>0 else .9)
        t=(y*side+.105)/.21;x-=.02*t;z-=.008*t
        v.co=Vector((x,y,z))
    for f in bm.faces:
        f.smooth=True
        f.material_index=1 if (f.normal.x<-.85 and f.calc_center_median().x<-.022) else 0
    me=bpy.data.meshes.new('Spion');bm.to_mesh(me);bm.free()
    me.materials.append(M['paint']);me.materials.append(M['chrome'])
    s='L' if side>0 else 'R'
    ob=link(bpy.data.objects.new('Spion_'+s,me),root);ob.location=c+Vector((-.005,side*.035,.025))
    sub=ob.modifiers.new('Halus','SUBSURF');sub.levels=1;sub.render_levels=1
    bm=bmesh.new();bmesh.ops.create_cone(bm,cap_ends=True,segments=16,radius1=.022,radius2=.016,depth=.12)
    for f in bm.faces:f.smooth=True
    me=bpy.data.meshes.new('SpionTangkai');bm.to_mesh(me);bm.free();me.materials.append(M['black'])
    st=link(bpy.data.objects.new('SpionTangkai_'+s,me),root)
    st.location=c+Vector((0,-side*.035,-.005));st.rotation_euler=(-side*math.pi/2,0,0);st.scale=(1.6,.7,1)

def build(paint_color):
    root=bpy.data.objects.new('VOLT_E1',None);link(root)
    M={}
    M['paint']=mat('Cat',lin(paint_color),metal=.55,rough=.24,coat=1.0,coatr=.025)
    M['glass']=mat('Kaca',(.012,.014,.02,1),metal=.0,rough=.02,coat=1.0,coatr=.0)
    M['rubber']=mat('Karet',(.014,.014,.016,1),rough=.62)
    M['rim']=mat('Velg',(.82,.84,.88,1),metal=1,rough=.2)
    M['chrome']=mat('Krom',(.9,.9,.93,1),metal=1,rough=.12)
    M['brake']=mat('CakramRem',(.32,.32,.34,1),metal=1,rough=.45)
    M['caliper']=mat('Kaliper',lin(0xd21f26),metal=.2,rough=.35,coat=.5)
    M['black']=mat('HitamDoff',(.02,.02,.022,1),rough=.55)
    M['trim']=mat('Trim',(.03,.03,.035,1),metal=.6,rough=.28)
    M['drl']=mat('LampuDRL',(1,1,1,1),rough=.1,emit=(.9,.95,1,1),es=30)
    M['tail']=mat('LampuBelakang',(.3,0,0,1),rough=.15,emit=(1,.03,.03,1),es=14)
    M['lens']=mat('LensaLampu',(.02,.02,.025,1),rough=.02,coat=1.0,coatr=.0)
    M['seam']=mat('Celah',(0,0,0,1),rough=.9)
    M['plate']=mat('Plat',(.9,.9,.88,1),rough=.5)
    M['leather']=mat('Kursi',(.55,.47,.36,1),rough=.6)
    M['dash']=mat('Dasbor',(.03,.03,.03,1),rough=.5)
    body=make_body();body.data.materials.append(M['paint']);body.data.materials.append(M['glass']);body.parent=root
    # lubang roda (boolean) + liner
    for (x,s) in((WB,1),(WB,-1),(-WB,1),(-WB,-1)):
        c=cyl_obj('arch',WR+.085,.5,(x,s*(TRACK+.02),WR));boolean_diff(body,c);bpy.data.objects.remove(c)
    bvh_ob=body
    dg=bpy.context.evaluated_depsgraph_get();ev=body.evaluated_get(dg);bvh=BVHTree.FromObject(body,dg)
    # celah panel di sisi kiri dan kanan
    for side in(1,-1):
        lines=[
            [(1.12,.34),(1.14,.62),(1.13,.95),(.98,1.19)],
            [(.0,.34),(-.01,.70),(-.02,1.19)],
            [(-1.0,.34),(-1.03,.70),(-1.0,1.21)],
            [(1.12,.32),(.3,.31),(-.5,.31),(-1.0,.32)],
            [(.98,1.19),(.2,1.20),(-.6,1.22),(-1.4,1.26)],
        ]
        for i,l in enumerate(lines):
            pts=project_line(bvh,l,side,.001)
            if len(pts)>=2:tube('Celah%d_%d'%(i,side),pts,.0022,M['seam']).parent=root
        # gagang pintu rata
        for (hx,hz) in((.55,1.08),(-.42,1.08)):
            p0=project_line(bvh,[(hx-.09,hz),(hx+.09,hz)],side,.004)
            if len(p0)==2:
                g=to_mesh(tube('Gagang',p0,.009,M['trim']));g.parent=root
                b=g.modifiers.new('bevel','BEVEL');b.width=.004;b.segments=3;b.limit_method='ANGLE';smooth(g)
                g.modifiers.new('wn','WEIGHTED_NORMAL').keep_sharp=True
        # spion
        p=project_line(bvh,[(1.02,1.16)],side,.03)
        if p:
            make_mirror(side,Vector((p[0].x,p[0].y+side*.06,p[0].z+.04)),M,root)
    # celah kap mesin dan bagasi
    hood=[(1.0,.93)]  # placeholder
    # lampu depan: strip DRL + lensa
    for side in(1,-1):
        hp=[(2.05,.70),(2.18,.72),(2.3,.68)]
        ps=[]
        for (x,z) in [(2.10,.71),(2.02,.74),(1.90,.78),(1.75,.815)]:
            o=Vector((x,side*.9,z+.6));h=bvh.ray_cast(o,Vector((0,0,-1)))
            if h[0] is None:continue
            ps.append(h[0]+h[1]*.003)
        # jalur lampu di ujung depan: garis y dari tengah ke sisi pada x tetap
    # strip DRL melintang depan (di ujung depan bodi, proyeksi sumbu X)
    def proj_x(ys,z,off=.003,sx=1):
        out=[]
        for y in ys:
            h=bvh.ray_cast(Vector((4,y,z)),Vector((-1,0,0)))
            if h[0] is not None:out.append(h[0]+h[1]*off)
        return out
    ys=[i*.05 for i in range(-17,18)]
    drl=proj_x(ys,.80);tube('DRL',drl,.011,M['drl']).parent=root
    lens_l=proj_x([i*.03 for i in range(6,30)],.66,.002);lens_r=proj_x([-i*.03 for i in range(6,30)],.66,.002)
    for l in(lens_l,lens_r):
        if len(l)>2:tube('Lensa',l,.026,M['lens']).parent=root
    # lampu belakang: bar penuh
    def proj_xr(ys,z,off=.003):
        out=[]
        for y in ys:
            h=bvh.ray_cast(Vector((-4,y,z)),Vector((1,0,0)))
            if h[0] is not None:out.append(h[0]+h[1]*off)
        return out
    tail=proj_xr([i*.05 for i in range(-17,18)],1.02);tube('LampuBelakang',tail,.014,M['tail']).parent=root
    tl=proj_xr([i*.05 for i in range(-17,18)],.66);tube('DiffuserGaris',tl,.006,M['trim']).parent=root
    def proj_z(pts,off=.02):
        out=[]
        for (x,y) in pts:
            h=bvh.ray_cast(Vector((x,y,3)),Vector((0,0,-1)))
            if h[0] is not None:out.append(h[0]+h[1]*off)
        return out
    for sd in(1,-1):
        rail=proj_z([(x,sd*.74) for x in [i*.12-1.5 for i in range(0,26)]],.045)
        if len(rail)>3:tube('RelAtap',rail,.017,M['trim']).parent=root
        for x in(-1.4,-.6,.2):
            p=proj_z([(x,sd*.74)],.0)
            if p:RBox(.05,.05,.05,.015,M['trim'],(p[0].x,p[0].y,p[0].z+.02)).parent=root
    for side in(1,-1):
        for wx in(WB,-WB):
            arc=[(wx+(WR+.10)*math.cos(t),WR+(WR+.10)*math.sin(t)) for t in [math.pi*k/24 for k in range(0,25)]]
            pts=project_line(bvh,arc,side,.004)
            if len(pts)>4:tube('TrimRoda',pts,.028,M['black']).parent=root
        clad=project_line(bvh,[(x,.44) for x in [i*.14-1.05 for i in range(0,16)]],side,.006)
        if len(clad)>3:tube('CladdingSill',clad,.05,M['black']).parent=root
    lo=proj_x(ys,.56,.004);tube('IntakeBawah',lo,.038,M['black']).parent=root
    ss=proj_x([i*.05 for i in range(-9,10)],.70,.003);tube('BarSensor',ss,.02,M['lens']).parent=root
    pc=project_line(bvh,[(-1.86,1.0)],1,.012)
    if pc:
        pf=RBox(.14,.02,.1,.03,M['paint'],(pc[0].x,pc[0].y,pc[0].z));pf.parent=root
    # plat nomor
    pl=RBox(.03,.52,.13,.01,M['plate'],(-2.44,0,.7));pl.parent=root
    # sill dan difuser
    # atap panorama (sedikit lebih terang) tidak dipakai
    # interior sederhana terlihat lewat kaca
    for x in(.35,-.6,-1.45):
        for y in(-.4,.4):
            seat=RBox(.5,.5,.16,.06,M['leather'],(x,y,.68));seat.parent=root
            back=RBox(.14,.5,.6,.06,M['leather'],(x-.26,y,1.0));back.parent=root;back.rotation_euler=(0,-.2,0)
    # roda
    wheels=[]
    ws=make_wheel_set(M)
    def place(objs,loc,rot_z):
        for o in objs:
            o.rotation_euler[2]=rot_z if rot_z else 0
            o.location=Vector(loc)
    templ=[ws['tire'],ws['disc'],ws['cal']]+ws['sport']+ws['aero']+ws['nuts']
    for o in [ws['disc'],ws['cal']]+ws['sport']+ws['aero']:o.scale=(RS,RS,RS)
    for o in ws['nuts']:o.location=o.location*RS
    names={}
    for k,(x,s) in enumerate(((WB,1),(WB,-1),(-WB,1),(-WB,-1))):
        grp=bpy.data.objects.new('Roda%d'%k,None);link(grp,root)
        grp.location=(x,s*TRACK,WR)
        if s<0:grp.rotation_euler=(0,0,math.pi)
        # untuk sisi kanan, rotasi 180° pada Z sudah membalik x,y; koordinat lokal tetap +y = luar
        for o in templ:
            c=o.copy();c.data=o.data;link(c,grp);c.location=o.location.copy() if hasattr(o,'location') else (0,0,0)
            if o in ws['aero']:c.name='VelgAero_'+c.name
            if o in ws['sport']:c.name='VelgSport_'+c.name
        wheels.append(grp)
    for o in templ:bpy.data.objects.remove(o)
    return root,M

# ================= studio dan render =================
def studio(hdri):
    w=bpy.data.worlds.new('W');bpy.context.scene.world=w;w.use_nodes=True;n=w.node_tree.nodes;l=w.node_tree.links;n.clear()
    tex=n.new('ShaderNodeTexEnvironment');tex.image=bpy.data.images.load(hdri);bg=n.new('ShaderNodeBackground');bg.inputs['Strength'].default_value=.55;out=n.new('ShaderNodeOutputWorld')
    l.new(tex.outputs['Color'],bg.inputs['Color']);l.new(bg.outputs['Background'],out.inputs['Surface'])
    bpy.ops.mesh.primitive_circle_add(vertices=128,radius=60,fill_type='NGON',location=(0,0,0));f=bpy.context.object
    f.data.materials.append(mat('Lantai',(.018,.02,.026,1),metal=.05,rough=.14))
    for (loc,rot,sz,en) in [((-5,-6,4.5),(1.1,0,-.6),5,2200),((6,-4,3),(1.2,0,.9),4,1300),((0,4,5),(0,0,0),6,900),((-6,5,2.5),(1.3,0,-2.4),3,900)]:
        bpy.ops.object.light_add(type='AREA',location=loc,rotation=rot);a=bpy.context.object;a.data.size=sz;a.data.energy=en
    bpy.ops.mesh.primitive_torus_add(major_radius=4.2,minor_radius=.04,major_segments=160,minor_segments=8,location=(0,0,.02))
    r=bpy.context.object;r.data.materials.append(mat('Cincin',(0,0,0,1),emit=(.85,1,.15,1),es=8))
def render(path,cam,tgt,res,samples,lens=45):
    sc=bpy.context.scene;sc.render.engine='CYCLES';c=sc.cycles;c.samples=samples;c.use_denoising=True;c.denoiser='OPENIMAGEDENOISE';c.device='CPU'
    c.max_bounces=8;c.glossy_bounces=6;c.transmission_bounces=6;c.caustics_reflective=False;c.caustics_refractive=False
    sc.render.resolution_x,sc.render.resolution_y=res;sc.view_settings.view_transform='AgX';sc.view_settings.look='AgX - Medium High Contrast'
    bpy.ops.object.camera_add(location=cam);cm=bpy.context.object;cm.data.lens=lens
    t=cm.constraints.new('TRACK_TO');e=bpy.data.objects.new('t',None);e.location=tgt;bpy.context.collection.objects.link(e);t.target=e;t.track_axis='TRACK_NEGATIVE_Z';t.up_axis='UP_Y'
    sc.camera=cm;sc.render.filepath=path;sc.render.image_settings.file_format='JPEG';sc.render.image_settings.quality=90;bpy.ops.render.render(write_still=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
root,M=build(0x9aa0a8)
if MODE in('render','both'):
    studio(os.path.join(HERE,'..','assets','hdri','studio.exr'))
    res=(960,540) if FAST else (1600,900);sm=32 if FAST else 128
    render(os.path.join(OUT,'volt_v2_3q.jpg'),(7.6,-6.6,2.0),(0,0,.85),res,sm)
    render(os.path.join(OUT,'volt_v2_side.jpg'),(0,-9,.9),(0,0,.85),res,sm,lens=55)
if MODE in('glb','both'):
    for o in list(bpy.data.objects):
        if o.name.startswith(('Lantai','Circle','Torus','Cincin')):bpy.data.objects.remove(o)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'volt_car.glb'),export_format='GLB',export_yup=True,export_apply=True)
print('selesai')
