from pathlib import Path
import shutil

ROOT = Path('/Users/yohann/Documents/operon (harness)')
SRC = ROOT / 'clips_10s_matrix'
DEST = ROOT / 'PACOTE_GERACAO_IA'
REF_Y = ROOT / 'styleframes/01_yohann_sentado_styleframe_v1.png'
REF_M = ROOT / 'styleframes/02_maximus_sentado_styleframe_v2_bone_preto_oculos.png'

items = [
 (1,'00.00','05.91','Yohann','sentado','clip_01_0-5_91.mp4'),
 (2,'05.91','10.20','Yohann','sentado','clip_02_5_91-10_20.mp4'),
 (3,'10.20','15.77','Yohann','sentado','clip_03_10_20-15_77.mp4'),
 (4,'15.77','20.32','Maximus','sentado','clip_04_15_77-20_32.mp4'),
 (5,'20.32','25.00','Maximus','sentado','clip_05_20_32-25_00.mp4'),
 (6,'25.00','28.03','Maximus','sentado','clip_06_25_00-28_03.mp4'),
 (7,'28.03','35.13','Yohann','sentado','clip_07_28_03-35_13.mp4'),
 (8,'35.13','40.41','Yohann','sentado','clip_08_35_13-40_41.mp4'),
 (9,'40.41','43.73','Yohann','sentado','clip_09_40_41-43_73.mp4'),
 (10,'43.73','49.35','Maximus','sentado','clip_10_43_73-49_35.mp4'),
 (11,'49.35','54.83','Maximus','sentado','clip_11_49_35-54_83.mp4'),
 (12,'54.83','58.28','Yohann','em pé','clip_12_54_83-58_28.mp4'),
 (13,'58.28','65.20','Yohann','em pé','clip_13_58_28-65_20.mp4'),
 (14,'65.20','70.72','Maximus','em pé','clip_14_65_20-70_72.mp4'),
 (15,'70.72','75.45','Maximus','em pé','clip_15_70_72-75_45.mp4'),
 (16,'75.45','76.67','Maximus','em pé','clip_16_75_45-76_67.mp4'),
]

def prompt(person, pose, duration):
    identity = (
      'Yohann: preserve exactly his face geometry, dark voluminous hair, full dark beard, narrow rectangular sunglasses, earrings/earbud when visible, skin texture and body proportions.'
      if person == 'Yohann' else
      'Maximus: preserve exactly his face geometry, light short beard, skin texture and body proportions. His approved look is a matte-black baseball cap and narrow rectangular black sunglasses; keep both stable in every frame.'
    )
    return f'''VIDEO-TO-VIDEO TRANSFORMATION — {duration:.2f} seconds — landscape 16:9

INPUT ROLES
- Video: the ONLY identity source and the absolute source of the real face, head, hair, beard, skin, body, performance, timing, speech, lip sync, pose, gesture, camera and composition.
- Reference image: STYLE REFERENCE ONLY for wardrobe, accessories, monochrome Operon art direction, materials and futuristic environment. Never use the person or face visible in the reference image as an identity source. Never blend, average, transfer or borrow facial traits from the reference image.

PRIMARY REQUEST
Transform the supplied video into the exact premium monochrome futuristic Operon universe shown in the reference image. The speaker is {person}, {pose}. Preserve the complete original spoken performance and every movement. Change only the environment and wardrobe/accessories necessary to match the supplied reference.

IDENTITY LOCK
{identity}
The original face from every source-video frame is a PROTECTED, UNEDITED REGION. Preserve it one-to-one, frame by frame. Do not regenerate, redraw, reconstruct, reinterpret, enhance, retouch, relight, smooth, sharpen, stylize or replace any part of the face or head.

Maintain the exact original facial pixels/appearance wherever technically possible: forehead, eyebrows, eye shape and spacing, eyelids, eye color, nose bridge and nostrils, cheeks, pores, blemishes, lips, teeth, mouth interior, jawline, beard boundary and density, ears, hairline, hair silhouette, wrinkles and asymmetries. Preserve the exact apparent age, ethnicity, skull proportions, head size, expression and gaze in every frame.

The output must look like the original video subject was cleanly composited into a transformed environment—not like an AI-generated recreation of that person. Zero identity drift is acceptable. If any requested styling conflicts with facial preservation, preserve the original face and performance instead of applying the styling.

ACCESSORY APPLICATION WITHOUT FACE RECONSTRUCTION
When adding or stabilizing sunglasses and Maximus's black cap, treat them as tracked overlay/accessory layers fitted onto the unchanged original head. Add only the accessory pixels; do not regenerate the skin, eyes, eyebrows, nose, cheeks, mouth, beard, ears, hairline or skull beneath or around them. Maintain correct occlusion, perspective and motion tracking without changing facial anatomy.

PERFORMANCE AND CONTINUITY LOCK
Use the video as motion and appearance authority. Preserve original lip sync, phoneme-by-phoneme mouth shapes, speech timing, blinking, micro-expressions, head turns, torso motion, hand choreography, finger count, arm positions, smartphone grip/placement, reflections, camera perspective, lens, crop and framing. Preserve temporal facial consistency with no frame-to-frame facial flicker or feature drift. Do not invent actions. No cuts, no time remapping, no slow motion. First and last frames must remain compositionally consistent with the source video.

SCENE TRANSFORMATION
Replace the ordinary balcony/neighborhood with a physically plausible monumental neo-futurist city: slender dark towers, black glass, graphite metal and a stormy pale-gray sky. Maintain the original balcony geometry and correct parallax. Domestic clutter becomes minimal dark architecture.

WARDROBE AND LOOK
Refined matte-black structured technical clothing, understated and premium, no logos, no armor. Strict true black-and-white palette: black, charcoal, graphite, silver and pale gray. Soft directional facial light, deep blacks with shadow detail and natural skin. Grounded photorealistic live-action commercial; restrained futuristic noir, never cosplay.
Apply the monochrome grade uniformly without changing facial structure or skin texture. Environment and clothing may be transformed; the face and head may only receive the same global black-and-white color conversion as the original footage, with no local facial edits.

BACKGROUND LIFE AND NANOPARTICLE CHOREOGRAPHY
Keep the original camera behavior exactly as the input video. The futuristic background must feel alive throughout the entire clip, with elegant continuous motion rather than a frozen backdrop.

- 0.0–1.0 s: the city is immediately alive. Several thin streams of thousands of microscopic black and silver nanoparticles are already moving slowly across the distant skyline in smooth coordinated arcs, like intelligent data currents carried through the air.
- Middle of clip: particle streams gently bend around tower silhouettes, separate into fine filaments and reunite into wider flowing bands. Use multiple depth layers: tiny sharp particles far above the skyline; softer medium-distance particles moving between buildings; only an occasional extremely subtle out-of-focus particle near the lens. Motion remains slow, fluid and physically coherent.
- Entire clip: storm clouds evolve almost imperceptibly, distant architectural lights breathe very softly, and buildings show minimal correct parallax derived only from the source camera movement. Nothing in the city is static, but nothing distracts from the speaker.
- Reflections: nanoparticle streams, cloud luminance and tower highlights create faint synchronized moving reflections on every visible black-glass surface, balcony window and glossy table. Each reflection follows correct perspective and moves consistently with its source, never as a separate overlay.
- Final 0.5 s: environmental motion continues naturally without freezing, accelerating or forming a transition, leaving a clean editable ending.

Particle behavior must read as sophisticated airborne nanotechnology/data matter—not birds, insects, dust, ash, rain, snow, smoke, sparks, glitter, confetti or a screen overlay. Particles never cross or obscure the speaker's face, mouth, hands or phone. No chaotic swarms, rapid pulses, explosions or large foreground blobs. Preserve visual hierarchy: person first, living city second.

TEXT
Generate no captions, typography, subtitles, logos or interface. Text will be added later in CapCut according to the speech.

NEGATIVE PROMPT
Different person, reference-image face transfer, identity blending, identity averaging, identity drift, facial flicker, face morphing, face replacement, face regeneration, reconstructed face, redrawn face, altered skull, altered head size, altered forehead, changed eyebrows, changed eye shape or spacing, changed eye color, changed nose, changed cheeks, changed lips, changed teeth, changed jawline, changed beard line or density, changed ears, changed hairline, changed hair volume, altered age, altered ethnicity, beautification, symmetry correction, skin smoothing, pore removal, blemish removal, makeup, facial relighting, artificial sharpening, plastic skin, altered mouth shapes, broken lip sync, changed expression, wardrobe flicker, accessory flicker, sunglasses reshaping the face, cap reshaping the skull, missing or changing sunglasses, missing or changing cap on Maximus, cap on Yohann, deformed hands, extra fingers, fused fingers, duplicated limbs, changed pose, invented gesture, moved or redesigned phone, frozen background, static sky, static reflections, particles stuck to screen, particles crossing face, birds, insects, dust, ash, rain, snow, smoke, sparks, fire, glitter, confetti, bokeh blobs, chaotic swarm, rapid particle motion, particle explosion, broken or unsynchronized reflections, warped architecture, green Matrix code, green tint, neon color, cybernetic implants, armor, leather trench coat, holographic UI, readable text, subtitles, logos, watermark, illustration, CGI-looking human, excessive depth of field, camera shake, zoom, cut, transition or speed change.'''

if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(exist_ok=True)
index = ['# Pacote de geração IA — Yohann + Maximus','', 'Em cada pasta: envie `01_VIDEO.mp4`, depois `02_REFERENCIA_ESTILO_NAO_IDENTIDADE.png`, copie `03_PROMPT_FACE_LOCK.txt` e gere em 16:9 mantendo a duração original. O vídeo é a única fonte autorizada do rosto e da identidade.','', '| # | Timecode | Pessoa | Posição | Pasta |','|---:|---|---|---|---|']
for n,start,end,person,pose,video in items:
    folder = DEST / f'{n:02d}_{person.upper()}_{start.replace(".","_")}-{end.replace(".","_")}'
    folder.mkdir(exist_ok=True)
    shutil.copy2(SRC/video, folder/'01_VIDEO.mp4')
    shutil.copy2(REF_Y if person=='Yohann' else REF_M, folder/'02_REFERENCIA_ESTILO_NAO_IDENTIDADE.png')
    dur=float(end)-float(start)
    (folder/'03_PROMPT_FACE_LOCK.txt').write_text(prompt(person,pose,dur), encoding='utf-8')
    (folder/'LEIA-ME.txt').write_text('1. Envie 01_VIDEO.mp4 primeiro: ele é a ÚNICA fonte do rosto e identidade.\n2. Envie 02_REFERENCIA_ESTILO_NAO_IDENTIDADE.png apenas como referência de cenário, roupa, acessórios e cores.\n3. Copie e cole todo o conteúdo de 03_PROMPT_FACE_LOCK.txt.\n4. Configure 16:9, mantenha a duração original e use a maior configuração disponível de preservação de identidade/estrutura do vídeo.\n5. Se a plataforma oferecer máscara/região protegida, proteja rosto, cabeça e pescoço e permita edição somente em roupa e fundo.\n', encoding='utf-8')
    index.append(f'| {n:02d} | {start}s–{end}s | {person} | {pose} | `{folder.name}` |')
(DEST/'00_INDICE.md').write_text('\n'.join(index)+'\n', encoding='utf-8')
shutil.copy2(ROOT/'prompts/style-lock-operon.md', DEST/'00_STYLE_LOCK.md')
print(f'{len(items)} pastas criadas em {DEST}')
