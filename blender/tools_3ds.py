"""Pembaca sederhana berkas .3ds (Autodesk 3D Studio) -> .obj + .mtl. Tidak memerlukan add-on Blender.
  python tools_3ds.py Tree1.3ds tree1.obj        # koordinat dipertahankan (sumbu Z ke atas)"""
import struct,sys
import numpy as np
def parse(path):
    d=open(path,'rb').read();objs=[];mats=[]
    def cstr(o):
        e=d.index(b'\0',o);return d[o:e].decode('latin1'),e+1
    def walk(o,end,ctx=None):
        while o<end:
            cid,ln=struct.unpack_from('<HI',d,o);e=o+ln
            if cid in(0x4D4D,0x3D3D,0x4100):walk(o+6,e,ctx)
            elif cid==0x4000:
                name,p=cstr(o+6);c={'name':name,'v':None,'f':None,'uv':None,'mg':[]};objs.append(c);walk(p,e,c)
            elif cid==0x4110:
                n=struct.unpack_from('<H',d,o+6)[0];ctx['v']=np.frombuffer(d,'<f4',n*3,o+8).reshape(n,3)
            elif cid==0x4120:
                n=struct.unpack_from('<H',d,o+6)[0];ctx['f']=np.frombuffer(d,'<u2',n*4,o+8).reshape(n,4)[:,:3];walk(o+8+n*8,e,ctx)
            elif cid==0x4130:
                name,p=cstr(o+6);n=struct.unpack_from('<H',d,p)[0];ctx['mg'].append((name,np.frombuffer(d,'<u2',n,p+2)))
            elif cid==0x4140:
                n=struct.unpack_from('<H',d,o+6)[0];ctx['uv']=np.frombuffer(d,'<f4',n*2,o+8).reshape(n,2)
            elif cid==0xAFFF:
                m={'name':'?'};mats.append(m);walk(o+6,e,m)
            elif cid==0xA000:ctx['name']=cstr(o+6)[0]
            elif cid==0xA200:walk(o+6,e,ctx)
            elif cid==0xA300:ctx['tex']=cstr(o+6)[0]
            elif cid==0xA020:
                c2,_=struct.unpack_from('<HI',d,o+6)
                if c2==0x0011:ctx['diff']=tuple(d[o+12:o+15])
            o=e
    walk(0,len(d));return objs,mats
def write_obj(objs,mats,out):
    with open(out,'w') as f,open(out.replace('.obj','.mtl'),'w') as mt:
        f.write('mtllib '+out.split('/')[-1].replace('.obj','.mtl')+'\n')
        for m in mats:
            dc=[x/255 for x in m.get('diff',(200,200,200))];mt.write(f"newmtl {m['name']}\nKd {dc[0]} {dc[1]} {dc[2]}\n")
        vo=1
        for o in objs:
            if o['v'] is None or o['f'] is None:continue
            f.write(f"o {o['name']}\n")
            for v in o['v']:f.write(f"v {v[0]} {v[1]} {v[2]}\n")
            uv=o['uv'] is not None and len(o['uv'])==len(o['v'])
            if uv:
                for u in o['uv']:f.write(f"vt {u[0]} {u[1]}\n")
            fm={}
            for name,idx in o['mg']:
                for i in idx:fm[int(i)]=name
            cur=None
            for i,t in enumerate(o['f']):
                mn=fm.get(i)
                if mn!=cur and mn:f.write(f"usemtl {mn}\n")
                cur=mn
                a,b,c=[int(x)+vo for x in t]
                f.write(f"f {a}/{a} {b}/{b} {c}/{c}\n" if uv else f"f {a} {b} {c}\n")
            vo+=len(o['v'])
if __name__=='__main__':
    o,m=parse(sys.argv[1]);write_obj(o,m,sys.argv[2]);print('objek',len(o),'bahan',[x['name'] for x in m])
