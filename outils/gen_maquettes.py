"""Maquettes ARCHE : 3 pavillons en style « maquette d'architecte », socle de 40 cm.
Repère glTF : Y vers le haut, unités en mètres. Le dessus du socle est à y = 0.
"""
import math, random, sys, os
import numpy as np
import trimesh
from shapely.geometry import Polygon
from trimesh.visual.material import PBRMaterial
from trimesh.visual import TextureVisuals

OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

def hexc(h, a=255):
    h = h.lstrip('#'); return [int(h[i:i+2], 16) for i in (0, 2, 4)] + [a]
MATS = {
    'socle':   dict(c='#c8a87a', r=0.75),
    'chant':   dict(c='#a8875d', r=0.8),
    'carton':  dict(c='#f4efe6', r=0.85),
    'carton2': dict(c='#e6dfd2', r=0.85),
    'vert':    dict(c='#7d9470', r=0.9),
    'vert2':   dict(c='#5a7150', r=0.9),
    'vertf':   dict(c='#2d4530', r=0.9),
    'jaune':   dict(c='#e8c96a', r=0.45),
    'brun':    dict(c='#6b4535', r=0.9),
    'terre':   dict(c='#c06548', r=0.9),
    'pise':    dict(c='#c8a87a', r=0.95),
    'pise2':   dict(c='#b98a5f', r=0.95),
    'sombre':  dict(c='#26241f', r=0.9),
    'nuage':   dict(c='#ffffff', r=1.0),
    'eau':     dict(c='#bcd9e0', r=0.1, a=150),
    'verre':   dict(c='#d6ebe4', r=0.05, a=40),
    'acryl':   dict(c='#f2f6f4', r=0.05, a=90),
}
def material(k):
    m = MATS[k]; a = m.get('a', 255)
    return PBRMaterial(name=k, baseColorFactor=hexc(m['c'], a), metallicFactor=0.0, roughnessFactor=m['r'],
                       alphaMode='BLEND' if a < 255 else 'OPAQUE', doubleSided=a < 255)

class Maquette:
    def __init__(self): self.parts = {}
    def add(self, k, mesh):
        self.parts.setdefault(k, []).append(mesh); return mesh
    def scene(self, name):
        sc = trimesh.Scene()
        for k, ms in self.parts.items():
            m = trimesh.util.concatenate(ms)
            m.visual = TextureVisuals(material=material(k))
            sc.add_geometry(m, node_name=f'{name}_{k}', geom_name=f'{name}_{k}')
        return sc

def T(x=0, y=0, z=0): return trimesh.transformations.translation_matrix([x, y, z])
def RY(a): return trimesh.transformations.rotation_matrix(a, [0, 1, 0])
def RX(a): return trimesh.transformations.rotation_matrix(a, [1, 0, 0])
def RZ(a): return trimesh.transformations.rotation_matrix(a, [0, 0, 1])
def box(sx, sy, sz, x=0, y=0, z=0, ry=0):
    m = trimesh.creation.box([sx, sy, sz]); m.apply_transform(RY(ry)); m.apply_translation([x, y, z]); return m
def cyl(r, h, x=0, y=0, z=0, sec=24):
    m = trimesh.creation.cylinder(radius=r, height=h, sections=sec); m.apply_transform(RX(-math.pi/2)); m.apply_translation([x, y + h/2, z]); return m
def seg(p1, p2, r, sec=8):
    return trimesh.creation.cylinder(radius=r, segment=[p1, p2], sections=sec)
def beam(p1, p2, w, h):
    p1, p2 = np.array(p1, float), np.array(p2, float); d = p2 - p1; L = np.linalg.norm(d)
    m = trimesh.creation.box([w, h, L])
    z = d / L; up = np.array([0, 1, 0]) if abs(z[1]) < 0.95 else np.array([1, 0, 0])
    x = np.cross(up, z); x /= np.linalg.norm(x); y = np.cross(z, x)
    M = np.eye(4); M[:3, 0], M[:3, 1], M[:3, 2], M[:3, 3] = x, y, z, (p1 + p2) / 2
    m.apply_transform(M); return m
def revolve(profile, x=0, y=0, z=0, sec=32):
    # profile : liste de (rayon, hauteur) ; révolution autour de Y
    pts = np.array(profile, float)
    m = trimesh.creation.revolve(pts, sections=sec)       # révolution autour de Z
    m.apply_transform(RX(-math.pi/2)); m.apply_translation([x, y, z]); return m
def blob(r, x, y, z, sy=0.55, sub=2):
    m = trimesh.creation.icosphere(subdivisions=sub, radius=r); m.apply_scale([1, sy, 1]); m.apply_translation([x, y, z]); return m

def tree(M, x, y, z, s=1.0, k='vert'):
    M.add('brun', cyl(0.0022*s, 0.018*s, x, y, z, 6))
    M.add(k, blob(0.011*s, x, y + 0.024*s, z, sy=1.0, sub=1))

def socle(M, w=0.40, d=0.40, h=0.03):
    M.add('socle', box(w, 0.004, d, 0, -0.002, 0))
    M.add('chant', box(w, h - 0.004, d, 0, -0.004 - (h - 0.004)/2, 0))

# ========================================================= 01 · LA VILLE AU-DESSUS DES NUAGES
def pavillon_01():
    random.seed(1); M = Maquette(); socle(M)
    # mer de nuages : coton blanc posé sur le socle
    for i in range(46):
        x, z = random.uniform(-0.145, 0.145), random.uniform(-0.145, 0.145)
        M.add('nuage', blob(random.uniform(0.025, 0.05), x, random.uniform(0.012, 0.03), z, sy=0.5))
    iles = [(-0.085, -0.04, 0.215, 0.085), (0.095, 0.035, 0.175, 0.068), (0.005, 0.115, 0.27, 0.055)]
    for (x, z, top, r) in iles:
        # roche en cône inversé, dessus plan engazonné
        M.add('brun', revolve([(0, top-0.12), (r*0.25, top-0.10), (r*0.55, top-0.06), (r*0.85, top-0.025), (r, top-0.006), (0, top-0.006)], x, 0, z, 9))
        M.add('vert', revolve([(0, top-0.006), (r, top-0.006), (r*0.99, top), (0, top)], x, 0, z, 9))
        # tige en acrylique transparent qui porte l'île (comme sur une vraie maquette)
        M.add('acryl', seg([x, 0.0, z], [x, top-0.11, z], 0.003, 12))
        # terrasses blanches qui tournent, comme des dalles empilées
        n = 3 + int(r * 40)
        for j in range(n):
            w = r * (0.9 - j * 0.08)
            M.add('carton', box(w, 0.006, w*0.62, x + 0.01, top + 0.003 + j*0.016, z, ry=j*0.21))
            M.add('carton2', box(w*0.55, 0.012, w*0.34, x + 0.01, top + 0.012 + j*0.016, z, ry=j*0.21))
            M.add('vert2', box(w, 0.004, 0.006, x + 0.01, top + 0.008 + j*0.016, z, ry=j*0.21).apply_translation([0, 0, 0]))
        for t in range(int(r*120)):
            a = random.uniform(0, 2*math.pi); rr = random.uniform(r*0.55, r*0.9)
            tree(M, x + math.cos(a)*rr, top, z + math.sin(a)*rr, random.uniform(0.7, 1.1), random.choice(['vert', 'vert2', 'vertf']))
        # cascade : nappe d'eau qui tombe du bord vers les nuages
        a = random.uniform(0, 2*math.pi); ex, ez = x + math.cos(a)*r*0.95, z + math.sin(a)*r*0.95
        M.add('eau', box(0.018, top-0.03, 0.002, ex, (top-0.03)/2 + 0.02, ez, ry=-a + math.pi/2))
    # passerelles jaunes entre les îles
    for (i, j) in [(0, 1), (0, 2), (1, 2)]:
        (x1, z1, t1, r1), (x2, z2, t2, r2) = iles[i], iles[j]
        M.add('jaune', beam([x1, t1 + 0.002, z1], [x2, t2 + 0.002, z2], 0.008, 0.003))
    return M

# ========================================================= 02 · LA SERRE GÉANTE
def pavillon_02():
    random.seed(2); M = Maquette(); socle(M)
    L, W, H = 0.30, 0.20, 0.17                     # longueur (x), largeur (z), hauteur
    M.add('pise', box(L + 0.04, 0.004, W + 0.04, 0, 0.002, 0))
    # profil anguleux : 6 facettes, faîtage pointu
    prof = [(-W/2, 0), (-W/2, 0.07), (-W*0.36, 0.125), (-W*0.17, 0.158), (0, H), (W*0.17, 0.158), (W*0.36, 0.125), (W/2, 0.07), (W/2, 0)]
    xs = np.linspace(-L/2, L/2, 9)
    for x in xs:   # arcs de structure
        for a, b in zip(prof, prof[1:]):
            M.add('carton', beam([x, a[1] + 0.004, a[0]], [x, b[1] + 0.004, b[0]], 0.004, 0.004))
    for a, b in zip(prof, prof[1:]):   # lisses longitudinales
        M.add('carton', beam([-L/2, b[1] + 0.004, b[0]], [L/2, b[1] + 0.004, b[0]], 0.003, 0.003))
    # vitrages : une nappe par facette + pignons
    for a, b in zip(prof, prof[1:]):
        p1, p2 = np.array([0, a[1] + 0.004, a[0]]), np.array([0, b[1] + 0.004, b[0]])
        mid = (p1 + p2) / 2; ln = np.linalg.norm(p2 - p1)
        g = beam([-L/2, mid[1], mid[2]], [L/2, mid[1], mid[2]], 0.0015, ln)
        ang = math.atan2(p2[1] - p1[1], p2[2] - p1[2])
        g.apply_translation(-mid); g.apply_transform(RX(-ang + math.pi/2)); g.apply_translation(mid)
        M.add('verre', g)
    poly = trimesh.creation.extrude_polygon(Polygon([(p[0], p[1] + 0.004) for p in prof]), 0.002)
    for x in (-L/2, L/2):
        g = poly.copy(); g.apply_transform(RY(math.pi/2)); g.apply_translation([x, 0, 0]); M.add('verre', g)
    # intérieur : allée, terrasses cultivées en gradins, logements sur mezzanine
    M.add('sable' if 'sable' in MATS else 'pise', box(L - 0.01, 0.003, 0.03, 0, 0.0055, 0))
    for side in (-1, 1):
        for k in range(3):
            zc = side * (0.035 + k * 0.022)
            M.add('vert2' if k % 2 else 'vert', box(L - 0.03, 0.012 + k*0.012, 0.02, 0, (0.012 + k*0.012)/2 + 0.004, zc))
        for i, x in enumerate(np.linspace(-L/2 + 0.04, L/2 - 0.04, 5)):
            M.add('carton2', box(0.032, 0.022, 0.026, x, 0.07 + 0.011, side * 0.075))
            M.add('jaune', box(0.034, 0.002, 0.002, x, 0.083, side * 0.0615))
        M.add('carton', box(L - 0.02, 0.003, 0.03, 0, 0.068, side * 0.075))
    for i in range(14):
        x = random.uniform(-L/2 + 0.02, L/2 - 0.02); z = random.choice([-1, 1]) * random.uniform(0.0, 0.02)
        tree(M, x, 0.004, z, random.uniform(1.3, 2.2), random.choice(['vert', 'vert2', 'vertf']))
    # jardins autour
    for i in range(18):
        a = random.uniform(0, 2*math.pi)
        x, z = random.uniform(-0.18, 0.18), random.choice([-1, 1]) * random.uniform(0.13, 0.18)
        tree(M, x, 0, z, random.uniform(0.8, 1.3), random.choice(['vert', 'vert2']))
    return M

# ========================================================= 03 · LE VILLAGE DE TERRE
def dome(M, x, z, r, k, bury=0.25, ouverture=True):
    n = 14
    prof = [(r*math.cos(t), r*math.sin(t) - r*bury) for t in np.linspace(math.asin(bury), math.pi/2, n)]
    prof = [(0, prof[0][1])] + prof + [(0, r - r*bury)]
    M.add(k, revolve(prof, x, 0, z, 40))
    if ouverture:
        a = random.uniform(0, 2*math.pi); h = r*0.45
        d = box(r*0.5, h, 0.01, x + math.cos(a)*(r*0.86), h/2, z + math.sin(a)*(r*0.86), ry=-a + math.pi/2)
        M.add('sombre', d)
def pavillon_03():
    random.seed(3); M = Maquette(); socle(M)
    # terrain : légère butte en terre
    M.add('pise', revolve([(0, 0), (0.185, 0), (0.15, 0.012), (0.08, 0.02), (0, 0.022)], 0, 0, 0, 48))
    domes = [(0, 0.01, 0.075, 'pise2'), (-0.105, -0.06, 0.05, 'terre'), (0.1, -0.075, 0.055, 'pise2'), (-0.09, 0.1, 0.045, 'pise2'),
             (0.105, 0.085, 0.048, 'terre'), (0.01, -0.13, 0.035, 'pise2'), (-0.14, 0.02, 0.032, 'terre')]
    for (x, z, r, k) in domes:
        dome(M, x, z, r, k)
        # toit végétal sur les plus grands dômes
        if r > 0.05: M.add('vert', revolve([(0, r*0.97 - r*0.25), (r*0.42, r*0.86 - r*0.25), (r*0.44, r*0.84 - r*0.25), (0, r*0.84 - r*0.25)], x, 0, z, 32))
    # chemins de terre battue, cour centrale, arbre et murets
    for (x, z, r, k) in domes[1:]:
        M.add('carton2', beam([0, 0.023, 0.01], [x, 0.02, z], 0.012, 0.002))
    for i in range(22):
        a = random.uniform(0, 2*math.pi); rr = random.uniform(0.12, 0.18)
        tree(M, math.cos(a)*rr, 0.006, math.sin(a)*rr, random.uniform(0.9, 1.5), random.choice(['vert', 'vert2', 'vertf']))
    for i in range(10):
        a = i/10*2*math.pi
        M.add('jaune', cyl(0.0025, 0.012 + (i % 3)*0.004, 0.17*math.cos(a), 0.0, 0.17*math.sin(a), 8))
    return M

for name, fn in [('pavillon_01', pavillon_01), ('pavillon_02', pavillon_02), ('pavillon_03', pavillon_03)]:
    sc = fn().scene(name)
    p = os.path.join(OUT, name + '.glb'); sc.export(p)
    b = sc.bounds
    print(name, round(os.path.getsize(p)/1024), 'Ko', np.round(b, 3).tolist())
