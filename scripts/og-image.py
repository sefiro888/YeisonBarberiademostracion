# Genera assets/img/og-yeison.jpg (1200x630): la tarjeta que se ve al compartir el enlace.
# El sello va en el centro porque WhatsApp a menudo recorta la imagen a un cuadrado central.
# Uso: python scripts/og-image.py
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1200, 630
CREAM, GOLD, GOLD_D, RED, MUTED = (246, 238, 216), (209, 171, 119), (169, 124, 75), (196, 30, 39), (190, 175, 150)
f = lambda n, s: ImageFont.truetype(f'C:/Windows/Fonts/{n}', s)

im = Image.new('RGB', (W, H), (10, 7, 5))

# Resplandor rojo cálido detrás del sello
glow = Image.new('L', (W, H), 0)
ImageDraw.Draw(glow).ellipse((W / 2 - 330, H / 2 - 300, W / 2 + 330, H / 2 + 300), fill=170)
im.paste(Image.new('RGB', (W, H), (92, 16, 20)), (0, 0), glow.filter(ImageFilter.GaussianBlur(120)))
d = ImageDraw.Draw(im)

# Tubos de poste de barbero arriba y abajo
def pole(y0, h):
    d.rectangle((0, y0, W, y0 + h), fill=(247, 244, 238))
    for x in range(-80, W + 80, 48):
        d.polygon([(x, y0 + h), (x + 12, y0 + h), (x + 12 + h, y0), (x + h, y0)], fill=(200, 16, 46))
        d.polygon([(x + 24, y0 + h), (x + 36, y0 + h), (x + 36 + h, y0), (x + 24 + h, y0)], fill=(28, 61, 155))
    d.rectangle((0, y0 - 3, W, y0 - 1), fill=(205, 205, 205))
    d.rectangle((0, y0 + h + 1, W, y0 + h + 3), fill=(120, 120, 120))
pole(4, 14)
pole(H - 18, 14)

# Sello circular negro oficial, centrado, con aros oro y rojo y halo de neón
cx, cy, r = W // 2, H // 2 + 2, 200
halo = Image.new('L', (W, H), 0)
ImageDraw.Draw(halo).ellipse((cx - r - 26, cy - r - 26, cx + r + 26, cy + r + 26), outline=255, width=14)
im.paste(Image.new('RGB', (W, H), (255, 70, 95)), (0, 0), halo.filter(ImageFilter.GaussianBlur(18)).point(lambda v: int(v * .55)))
d.ellipse((cx - r - 16, cy - r - 16, cx + r + 16, cy + r + 16), outline=RED, width=3)
d.ellipse((cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8), outline=GOLD, width=4)
seal = Image.open('assets/img/marca/logo-negro.png').convert('RGBA').resize((2 * r, 2 * r), Image.LANCZOS)
im.paste(seal, (cx - r, cy - r), seal)

def centered(text, font, x0, x1, y, fill):
    w = d.textlength(text, font=font)
    d.text((x0 + (x1 - x0 - w) / 2, y), text, font=font, fill=fill)

# Columna izquierda: quién y valoración
L0, L1 = 30, 370
centered('YEISON', f('BOD_B.TTF', 30), L0, L1, 112, GOLD)
centered('Barber Shop', f('BOD_R.TTF', 58), L0, L1, 148, CREAM)
centered('Barbería en Fene · A Coruña', f('arial.ttf', 20), L0, L1, 228, MUTED)
d.line((L0 + 90, 276, L1 - 90, 276), fill=GOLD_D, width=2)
centered('★★★★★', f('seguisym.ttf', 34), L0, L1, 300, GOLD)
centered('5,0', f('BOD_B.TTF', 74), L0, L1, 342, CREAM)
centered('229 reseñas en Booksy', f('arial.ttf', 20), L0, L1, 436, MUTED)
centered('Yeison y Juan', f('BOD_I.TTF', 30), L0, L1, 480, (225, 70, 78))

# Columna derecha: servicios y reserva
R0, R1 = 830, 1170
centered('SERVICIOS', f('BOD_B.TTF', 24), R0, R1, 112, GOLD)
items = ['Degradados y burst fade', 'Texturas y diseños', 'Barba y afeitado', 'Cejas · peques · jubilados']
for i, t in enumerate(items):
    y = 160 + i * 52
    centered(t, f('georgia.ttf', 25), R0, R1, y, CREAM)
d.line((R0 + 90, 380, R1 - 90, 380), fill=GOLD_D, width=2)
centered('Corte desde 15 €', f('BOD_B.TTF', 34), R0, R1, 400, CREAM)
centered('Reserva online o por WhatsApp', f('arial.ttf', 20), R0, R1, 452, MUTED)
centered('Av. Marqués de Figueroa, 15', f('arial.ttf', 20), R0, R1, 484, MUTED)

im.save('assets/img/og-yeison.jpg', quality=86, optimize=True, progressive=True)
print('ok')
