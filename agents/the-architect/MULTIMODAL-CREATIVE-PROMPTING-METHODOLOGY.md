# Multimodal Creative Prompting Methodology

**Visual & audio AI layer for The Architect.** Text-to-image and text-to-video prompt blueprints that match written copy — style codes, camera, lighting, and hook-aligned visuals.

**One voice.** Visuals extend the sales message; never generic stock energy.

**Paired:** `ART-DIRECTION-PRODUCT-DESIGN-METHODOLOGY.md` · `OMNI-FORMAT-EXECUTION-METHODOLOGY.md` (F-AD)

---

## Multimodal Prompting in One Sentence

> **Prompt the visual like you prompt the headline — specific scene, specific emotion, specific proof — so the image sells before they read word one.**

---

## Text-to-Image Prompt Architecture (Midjourney / DALL·E / Flux)

### Prompt formula

```
[SUBJECT] + [ACTION/EMOTION] + [SETTING] + [LIGHTING] + [CAMERA/LENS] + [STYLE] + [COLOR PALETTE] + [--ar aspect]
```

### Style code library

| Use case | Style directive |
|---|---|
| **UGC ad** | iPhone photo, natural light, slight grain, authentic, not staged |
| **Premium brand** | Editorial photography, soft box lighting, shallow depth of field, 85mm |
| **SaaS hero** | Clean 3D isometric, gradient background, product UI mockup |
| **Testimonial** | Headshot, warm ring light, office bokeh, trustworthy |
| **Before/after** | Split frame, consistent lighting both sides, documentary |
| **Pattern interrupt** | High contrast, surreal element, bold color pop |

### Example prompts (match copy hook)

**Hook:** *"How a one-legged golfer added 50 yards"*

```
Midjourney: golfer mid-swing on misty dawn fairway, dramatic low angle, 
golden hour backlight, motion blur on club, documentary sports photography, 
cinematic --ar 16:9 --style raw
```

**Hook:** *"The AI agent that books calls while you sleep"*

```
DALL·E: modern home office at night, laptop glow on desk, phone notification 
showing calendar booking, cozy ambient light, photorealistic, shallow DOF, 
warm navy and gold palette --ar 4:5
```

---

## Text-to-Video Prompt Architecture (Runway / Pika / Sora-style)

### Video beat table (sync to ad script)

| Timestamp | Visual prompt | Motion | Text-on-screen |
|---|---|---|---|
| 0–3s | Extreme close-up, pattern interrupt | Quick zoom | Hook line |
| 3–15s | Problem scene — frustrated avatar | Handheld, authentic | Pain stat |
| 15–45s | Mechanism demo — screen/UI | Smooth pan | Mechanism name |
| 45–60s | Proof + CTA | Static hero + button pulse | CTA |

### Camera directives

| Directive | Effect |
|---|---|
| **Dolly in** | Intimacy, urgency |
| **Handheld** | UGC authenticity |
| **Overhead flat lay** | Product/unboxing |
| **Screen recording** | SaaS demo proof |
| **Split screen** | Before/after |

---

## Visual Hook Alignment Checklist

- [ ] Visual matches ad hook in first frame (0–1s)
- [ ] Color palette matches brand design system
- [ ] Face in frame for Meta/TikTok (when policy allows)
- [ ] No prohibited imagery (before/after body, cash stacks — platform dependent)
- [ ] Aspect ratio correct per placement (9:16 reel, 1:1 feed, 16:9 YouTube)

**Compliance:** Run visual concepts through `COMPLIANCE-RISK-METHODOLOGY.md` ad policy defender.

---

## Deliverable package

1. **Visual brief** — mood, palette, references
2. **Image prompts** — 3–5 variants per key scene
3. **Video shot list** — timestamp + prompt + motion
4. **Negative prompts** — what to exclude (blurry, watermark, extra fingers)
5. **Asset map** — which visual pairs which copy block

**Output tag:** `<visual_prompts>`

---

See also: `PREMIUM-WEBSITE-DESIGN-METHODOLOGY.md` · `OMNICHANNEL-GROWTH-METHODOLOGY.md`
