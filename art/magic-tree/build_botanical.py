"""Reproducible Blender authoring/export for Magic Tree's matte botanical kit.

Run: blender --background --python art/magic-tree/build_botanical.py
Geometry is authored in Z-up Blender space and exported to Y-up WebGPU space.
The .blend retains separate editable assets, materials and a lit contact sheet.
"""
import bpy
import json
import math
import random
import struct
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
ART = ROOT / 'art' / 'magic-tree'
OUT = ROOT / 'client' / 'src' / 'components' / 'MagicTreeWebGPU' / 'assets'
OUT.mkdir(parents=True, exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.preferences.filepaths.save_version = 0
rng = random.Random(8197)


def material(name):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Roughness'].default_value = 0.92
    bsdf.inputs['Specular IOR Level'].default_value = 0.12
    bsdf.inputs['Metallic'].default_value = 0
    color = mat.node_tree.nodes.new('ShaderNodeVertexColor')
    color.layer_name = 'Pigment'
    mat.node_tree.links.new(color.outputs['Color'], bsdf.inputs['Base Color'])
    return mat


MAT = material('Matte botanical pigment')


def mesh(name, vertices, faces, colors):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices, [], faces)
    data.update()
    pigment = data.color_attributes.new(name='Pigment', type='FLOAT_COLOR', domain='POINT')
    for i, color in enumerate(colors):
        pigment.data[i].color = (*color, 1)
    obj = bpy.data.objects.new(name, data)
    bpy.context.collection.objects.link(obj)
    data.materials.append(MAT)
    return obj


def blend(a, b, t):
    return tuple(x * (1-t) + y*t for x, y in zip(a, b))


def bezier(points, t):
    a, b, c, d = [Vector(p) for p in points]
    return a*(1-t)**3 + b*3*t*(1-t)**2 + c*3*t*t*(1-t) + d*t**3


wood_v, wood_f, wood_c, anchors = [], [], [], []


def tube(points, start_radius, end_radius, steps=12, sides=8):
    base = len(wood_v)
    for j in range(steps+1):
        t = j / steps
        p = bezier(points, t)
        tangent = (bezier(points, min(1, t+0.001)) - bezier(points, max(0, t-0.001))).normalized()
        right = tangent.cross(Vector((1, 0, 0))).normalized()
        up = right.cross(tangent).normalized()
        radius = start_radius * (1-t) + end_radius*t
        for k in range(sides):
            a = k / sides * math.tau
            ridge = 1 + 0.065 * math.sin(k*3 + j*0.45)
            wood_v.append(tuple(p + (right*math.cos(a) + up*math.sin(a))*radius*ridge))
            wood_c.append(blend((0.22, 0.12, 0.065), (0.43, 0.28, 0.16), 0.3 + 0.32*math.sin(a+0.5)**2))
            if j < steps:
                n = base + j*sides+k
                nxt = base+j*sides+(k+1)%sides
                wood_f.append((n, nxt, nxt+sides, n+sides))


# Bent, tapering trunk; no straight cylindrical pole. Root flares ground it.
trunk = [(0,0,0), (-0.065,0.025,0.28), (0.09,-0.025,0.65), (0.015,0,1.01)]
tube(trunk, 0.031, 0.002, 32, 10)
for i in range(7):
    a = i*math.tau/7
    tip = (math.cos(a)*0.105, math.sin(a)*0.105, 0.002)
    tube([(0,0,0.08), (tip[0]*0.2,tip[1]*0.2,0.025), (tip[0]*0.7,tip[1]*0.7,0.012), tip], 0.014,0.0015,7,7)

# Layered curved scaffolds, decreasing reach towards the top; twig tips droop.
for i in range(15):
    t = 0.31 + i*0.039
    start = bezier(trunk, t)
    a = i*2.399963 + rng.uniform(-0.18,0.18)
    reach = 0.43 * (1 - (t-0.31)*1.18) * rng.uniform(0.91,1.08)
    dx, dy = math.cos(a), math.sin(a)
    end = start + Vector((dx*reach,dy*reach,0.10+rng.uniform(-0.015,0.07)))
    points = [start, start+Vector((dx*reach*0.22,dy*reach*0.22,0.17)),
              end+Vector((-dx*reach*0.16,-dy*reach*0.16,0.17)), end]
    tube(points, 0.013*(1-t*0.45),0.0013,14,7)
    for j in range(2,9):
        s = j/10
        parent = bezier(points,s)
        for side in [-1,1]:
            angle = a+side*rng.uniform(0.5,1.0)
            length = rng.uniform(0.07,0.13)*(0.6+s*0.4)
            delta = Vector((math.cos(angle)*length, math.sin(angle)*length, -0.035-s*0.035))
            twig = [parent,parent+delta*0.3+Vector((0,0,0.04)),parent+delta*0.75+Vector((0,0,0.02)),parent+delta]
            tube(twig,0.0034*(1-s*0.4),0.00045,5,5)
            for u in [0.2,0.48,0.75,1.0]:
                p = bezier(twig,u)
                anchors.append([*p, rng.uniform(0.022,0.042)])
    anchors.append([*end,0.037])
for i in range(14):
    p = bezier(trunk,0.82+i*0.012)
    anchors.append([*p,0.047])
assets = {'branch': mesh('Branch / curved scaffold',wood_v,wood_f,wood_c)}


def blossom():
    v,f,c = [],[],[]
    for petal in range(5):
        angle = petal*math.tau/5+0.15
        base = len(v)
        for j in range(5):
            t=j/4
            width=0.27*math.sin(math.pi*t*0.96)**0.7+0.015
            for side in [-1,0,1]:
                x=side*width
                y=0.07+t*0.49
                z=0.02+0.14*t*t+abs(side)*0.025*math.sin(t*math.pi)
                v.append((x*math.cos(angle)-y*math.sin(angle),x*math.sin(angle)+y*math.cos(angle),z))
                c.append(blend((0.76,0.23,0.39),(1.0,0.76,0.82),t*0.83+abs(side)*0.1))
        for j in range(4):
            for k in range(2):
                n=base+j*3+k
                f.append((n,n+1,n+4,n+3))
    # Small warm centre, not a glossy ball.
    base=len(v)
    v.append((0,0,0.08)); c.append((0.68,0.47,0.13))
    for i in range(8):
        a=i*math.tau/8
        v.append((math.cos(a)*0.08,math.sin(a)*0.08,0.065)); c.append((0.86,0.66,0.25))
    for i in range(8): f.append((base,base+1+i,base+1+(i+1)%8))
    return mesh('Spring / five cupped petals',v,f,c)


def leaf(name, autumn=False, frost=False):
    v,f,c = [],[],[]
    for j in range(9):
        t=j/8
        width=0.24*math.sin(math.pi*t)**0.85+0.002
        if autumn: width *= 0.75+0.3*math.cos(t*math.pi*6)**2
        for side in [-1,0,1]:
            v.append((side*width,t-0.45,0.09*math.sin(t*math.pi)-abs(side)*0.035+t*t*0.04))
            low,high=((0.55,0.19,0.055),(0.92,0.58,0.17)) if autumn else ((0.12,0.31,0.045),(0.55,0.72,0.24))
            color=blend(low,high,t*0.65+(0.12 if side==0 else 0))
            if frost: color=blend(color,(0.79,0.85,0.8),0.8)
            c.append(color)
    for j in range(8):
        for k in range(2):
            n=j*3+k
            f.append((n,n+1,n+4,n+3))
    return mesh(name,v,f,c)


assets['spring']=blossom()
assets['summer']=leaf('Summer / folded serrated leaf')
assets['autumn']=leaf('Autumn / curled copper leaf',True)
assets['winter']=leaf('Winter / frost coated leaf',frost=True)


def grass(season):
    v,f,c = [],[],[]
    palettes=[((0.13,0.28,0.045),(0.48,0.66,0.20)),((0.12,0.27,0.045),(0.43,0.60,0.17)),
              ((0.25,0.22,0.08),(0.64,0.53,0.25)),((0.24,0.31,0.25),(0.72,0.78,0.69))]
    low,high=palettes[season]
    for i in range(17):
        a=i*2.399963+rng.uniform(-0.3,0.3)
        h=rng.uniform(0.45,1.0)*(0.66 if season==3 else 1)
        lean=rng.uniform(0.22,0.55)
        root=Vector((math.cos(a)*rng.uniform(0.02,0.13),math.sin(a)*rng.uniform(0.02,0.13),0))
        forward=Vector((math.cos(a),math.sin(a),0))
        side=Vector((-math.sin(a),math.cos(a),0))
        base=len(v)
        for j in range(6):
            t=j/5
            p=root+Vector((0,0,h*t))+forward*(t*t*lean)
            width=(0.018+rng.random()*0.009)*(1-t*0.98)
            for s in [-1,0,1]:
                v.append(tuple(p+side*s*width+forward*(abs(s)*0.007)))
                c.append(blend(low,high,min(1,t*0.9+(0.1 if s==0 else 0))))
        for j in range(5):
            for k in range(2):
                n=base+j*3+k
                f.append((n,n+1,n+4,n+3))
    # Delicate seed heads in autumn and pale frost tips in winter are geometry,
    # not a uniform recolouring of the summer tuft.
    if season>=2:
        for i in range(4):
            a=i*2.399963
            for k in range(3):
                x,y=math.cos(a)*(0.12+k*0.016),math.sin(a)*(0.12+k*0.016)
                z=(0.67+k*0.04)*(0.7 if season==3 else 1)
                base=len(v)
                v.extend([(x-0.026,y,z),(x,y-0.014,z+0.055),(x+0.026,y,z),(x,y+0.014,z-0.018)])
                c.extend([high]*4); f.append((base,base+1,base+2,base+3))
    return mesh(['Spring / tender grass','Summer / meadow tuft','Autumn / dry seed heads','Winter / frost sedge'][season],v,f,c)


for i,s in enumerate(['spring','summer','autumn','winter']): assets['grass_'+s]=grass(i)

# Runtime binary: triangle-list position(3), normal(3), linear pigment(3).
# One lightweight buffer per selected botanical asset; no texture downloads.
floats=[]
manifest={'version':1,'stride':9,'meshes':{},'anchors':[[round(x,6),round(z,6),round(-y,6),round(r,6)] for x,y,z,r in anchors]}
for key,obj in assets.items():
    data=obj.data
    data.calc_loop_triangles()
    offset=len(floats)
    colors=data.color_attributes['Pigment']
    for tri in data.loop_triangles:
        for index in tri.vertices:
            vert=data.vertices[index]
            x,y,z=vert.co
            nx,ny,nz=vert.normal
            floats.extend([x,z,-y,nx,nz,-ny,*colors.data[index].color[:3]])
    manifest['meshes'][key]={'offset':offset,'count':(len(floats)-offset)//9}
    obj['runtime_asset']=key
    obj['surface']='Matte pigment / no clearcoat / roughness 0.92'
with (OUT/'botanical.bin').open('wb') as file: file.write(struct.pack('<'+'f'*len(floats),*floats))
(OUT/'botanical.json').write_text(json.dumps(manifest,separators=(',',':')),encoding='utf8')

# Editable kit arranged as a contact sheet. Export includes only these assets.
for i,(key,obj) in enumerate(assets.items()):
    if key=='branch':
        obj.location=(-3.4,0,0); obj.scale=(3,3,3)
    elif key.startswith('grass_'):
        j=['spring','summer','autumn','winter'].index(key[6:])
        obj.location=(-0.9+j*1.55,-0.7,0)
    else:
        j=['spring','summer','autumn','winter'].index(key)
        obj.location=(-0.9+j*1.55,1.0,1.1)
        obj.rotation_euler=(math.radians(55),0,0)
bpy.ops.object.select_all(action='DESELECT')
for obj in assets.values(): obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(ART/'botanical-kit.glb'),export_format='GLB',use_selection=True,export_animations=False,export_vertex_color='ACTIVE')

# Neutral paper studio, soft area lights; no HDR gloss or bloom.
floor_mat=bpy.data.materials.new('Warm paper'); floor_mat.diffuse_color=(0.78,0.74,0.65,1)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-0.04))
bpy.context.object.data.materials.append(floor_mat)
for name,location,power,size in [('Softbox',(-3,-4,8),950,7),('Fill',(4,2,6),550,5)]:
    data=bpy.data.lights.new(name,'AREA'); data.energy=power; data.shape='DISK'; data.size=size
    obj=bpy.data.objects.new(name,data); bpy.context.collection.objects.link(obj); obj.location=location
    obj.rotation_euler=(Vector((0,0,0.5))-obj.location).to_track_quat('-Z','Y').to_euler()
camera_data=bpy.data.cameras.new('Botanical kit camera')
camera=bpy.data.objects.new('Botanical kit camera',camera_data); bpy.context.collection.objects.link(camera)
camera.location=(6,-11,8); camera.rotation_euler=(Vector((0.3,0,1.0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera_data.type='ORTHO'; camera_data.ortho_scale=10
scene=bpy.context.scene; scene.camera=camera
scene.render.engine='CYCLES'; scene.cycles.samples=24
scene.world.color=(0.65,0.65,0.65)
scene.view_settings.view_transform='AgX'
scene.render.resolution_x=1400; scene.render.resolution_y=900; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.filepath=str(ART/'botanical-kit.png')
bpy.ops.wm.save_as_mainfile(filepath=str(ART/'botanical-kit.blend'))
bpy.ops.render.render(write_still=True)
print('BOTANICAL_EXPORT',json.dumps({key:value['count']//3 for key,value in manifest['meshes'].items()}))
