# Genera assets/img/og.jpg (1200x630), la vista previa al compartir el enlace: python scripts/og-image.py
from PIL import Image, ImageDraw, ImageFont, ImageOps, ImageFilter
W, H = 1200, 630
CREAM, GOLD, RED, INK = (246, 238, 216), (209, 171, 119), (196, 30, 39), (12, 9, 7)
im = Image.new('RGB', (W, H), INK)
# Fondo: resplandor rojo cálido
glow = Image.new('L', (W, H), 0); ImageDraw.Draw(glow).ellipse((-200, -150, 700, 750), fill=120)
im.paste(Image.new('RGB', (W, H), (70, 14, 16)), (0, 0), glow.filter(ImageFilter.GaussianBlur(160)))
# Fotos reales en arco a la derecha
def arch(path, size):
    ph = ImageOps.fit(Image.open(path).convert('RGB'), size)
    m = Image.new('L', size, 0); d = ImageDraw.Draw(m)
    w, h = size; d.rounded_rectangle((0, w // 2, w, h), 10, fill=255); d.ellipse((0, 0, w, w), fill=255)
    return ph, m
for (path, x, y, size) in [('assets/img/trabajos/trabajo-03.jpg', 760, 70, (200, 300)), ('assets/img/trabajos/trabajo-32.jpg', 975, 130, (190, 285))]:
    ph, m = arch(path, size)
    ring = Image.new('L', (size[0] + 12, size[1] + 12), 0); ImageDraw.Draw(ring).rounded_rectangle((0, size[0] // 2, size[0] + 12, size[1] + 12), 14, fill=255); ImageDraw.Draw(ring).ellipse((0, 0, size[0] + 12, size[0] + 12), fill=255)
    im.paste(Image.new('RGB', ring.size, GOLD), (x - 6, y - 6), ring)
    im.paste(ph, (x, y), m)
# Sello circular negro oficial
seal = Image.open('assets/img/marca/logo-negro.png').convert('RGBA'); seal.thumbnail((250, 250))
d = ImageDraw.Draw(im)
d.ellipse((60 - 8, 60 - 8, 60 + 250 + 8, 60 + 250 + 8), outline=GOLD, width=3)
d.ellipse((60 - 16, 60 - 16, 60 + 250 + 16, 60 + 250 + 16), outline=RED, width=2)
im.paste(seal, (60, 60), seal)
f = lambda n, s: ImageFont.truetype(f'C:/Windows/Fonts/{n}', s)
d.text((370, 92), 'YEISON', font=f('BOD_B.TTF', 30), fill=GOLD)
d.text((366, 128), 'Barber Shop', font=f('BOD_R.TTF', 66), fill=CREAM)
d.text((370, 220), 'Barbería en Fene · A Coruña', font=f('arial.ttf', 24), fill=(200, 186, 160))
# Neón OPEN
neon = Image.new('RGBA', (W, H), (0, 0, 0, 0)); nd = ImageDraw.Draw(neon)
nd.text((372, 268), 'O P E N', font=f('arialbd.ttf', 38), fill=(255, 60, 90, 255))
im.paste(neon.filter(ImageFilter.GaussianBlur(9)), (0, 0), neon.filter(ImageFilter.GaussianBlur(9)))
d.text((372, 268), 'O P E N', font=f('arialbd.ttf', 38), fill=(255, 246, 236))
d.text((60, 400), 'Cortes con oficio,', font=f('BOD_R.TTF', 54), fill=CREAM)
d.text((60, 462), 'trato de casa.', font=f('BOD_I.TTF', 56), fill=RED)
d.text((62, 548), '★ 5,0 en Booksy · 229 reseñas · Reserva online', font=f('seguisym.ttf', 22), fill=GOLD)
# Tubo de poste de barbero abajo
for x in range(-60, W + 60, 44):
    d.polygon([(x, H - 14), (x + 11, H - 14), (x + 19, H), (x + 8, H)], fill=(200, 16, 46))
    d.polygon([(x + 22, H - 14), (x + 33, H - 14), (x + 41, H), (x + 30, H)], fill=(28, 61, 155))
d.rectangle((0, H - 17, W, H - 15), fill=(200, 200, 200))
im.save('assets/img/og.jpg', quality=88, optimize=True)
print('ok')
