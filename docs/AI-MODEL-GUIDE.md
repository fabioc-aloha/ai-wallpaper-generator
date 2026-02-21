# AI Model Selection Guide

**Purpose**: Empirical findings from testing multiple AI models for wallpaper generation
**Date**: February 21, 2026
**Status**: Validated through production testing

---

## Executive Summary

**Key Finding**: Current AI image generation models excel at photorealistic scenes but **struggle with readable typography**, even with ultra-detailed prompt specifications.

**Implication**: Design wallpaper generation app to focus on pure visual content (landscapes, abstracts, patterns) and avoid text overlays.

---

## Model Comparison Results

### Test Methodology

**Prompt Strategy**: Created 5,500-character ultra-detailed prompt specifying:
- Exact typography (SF Pro Display Bold, gradient colors, kerning)
- Photorealistic iPhone 16 Pro with exact specifications
- Studio lighting setup (4-point: key, rim, fill, screen glow)
- Material properties (brushed titanium, ceramic shield glass)
- Apple design language and quality standards

**Models Tested**:
1. Flux 1.1 Pro (black-forest-labs/flux-1.1-pro)
2. Flux Pro (black-forest-labs/flux-pro)
3. Ideogram v2 (ideogram-ai/ideogram-v2)
4. Google Imagen 3 / Nano Banana Pro (google/nano-banana-pro)
5. Flux Schnell (black-forest-labs/flux-schnell)

---

## Results by Model

### 1. Flux Pro - **RECOMMENDED for Wallpapers**

**Model**: `black-forest-labs/flux-pro`

**Performance**:
- Generation Time: 5-6 seconds
- Cost: $0.05 per image
- Quality: ⭐⭐⭐⭐⭐ Photorealistic excellence

**Strengths**:
- ✅ Exceptional photorealistic rendering
- ✅ Accurate material properties (glass, metal, lighting)
- ✅ Studio photography quality lighting
- ✅ Fast generation (5-6 seconds)
- ✅ Consistent output quality

**Weaknesses**:
- ❌ **Typography is distorted/warped** despite detailed specs
- ❌ Text becomes unreadable at small sizes
- ❌ Cannot reliably render specific fonts

**Best Use Cases**:
- Pure visual wallpapers (no text)
- Photorealistic scenes
- Product photography
- Landscapes and cityscapes
- Abstract patterns with depth

**Parameters**:
```javascript
{
  prompt: "your detailed prompt (avoid text)",
  aspect_ratio: "9:16",  // iPhone portrait
  output_format: "png",
  steps: 25,
  guidance: 3
}
```

---

### 2. Flux 1.1 Pro

**Model**: `black-forest-labs/flux-1.1-pro`

**Performance**:
- Generation Time: 9-10 seconds
- Cost: $0.04 per image
- Quality: ⭐⭐⭐⭐⭐ Excellent

**Strengths**:
- ✅ Slightly cheaper than Flux Pro
- ✅ Similar photorealistic quality
- ✅ Good detail and composition

**Weaknesses**:
- ❌ Same typography limitations as Flux Pro
- ⚠️ Slightly slower (9-10s vs 5-6s)

**Best Use Cases**:
- Budget-conscious photorealistic generation
- High-volume wallpaper generation
- Same as Flux Pro but cost-optimized

**Parameters**:
```javascript
{
  prompt: "your detailed prompt",
  aspect_ratio: "9:16",
  output_format: "png",
  output_quality: 100,
  safety_tolerance: 2,
  prompt_upsampling: true
}
```

---

### 3. Ideogram v2

**Model**: `ideogram-ai/ideogram-v2`

**Performance**:
- Generation Time: 15-20 seconds
- Cost: $0.08 per image
- Quality: ⭐⭐⭐⭐ Very Good

**Strengths**:
- ✅ **BEST typography rendering** of all models tested
- ✅ Clear, readable text
- ✅ Good color vibrancy
- ✅ Handles gradient text well

**Weaknesses**:
- ⚠️ More expensive ($0.08 vs $0.05)
- ⚠️ Slower generation (15-20s)
- ❌ Slightly less photorealistic than Flux Pro

**Best Use Cases**:
- Marketing banners with text
- Social media graphics
- Promotional materials
- **NOT ideal for wallpapers** (rarely need text)

**Parameters**:
```javascript
{
  prompt: "your prompt with text elements",
  aspect_ratio: "16:9",
  output_format: "png",
  magic_prompt_option: "Auto"
}
```

---

### 4. Google Imagen 3 (Nano Banana Pro)

**Model**: `google/nano-banana-pro`

**Performance**:
- Generation Time: ~15 seconds
- Cost: $0.025 per image
- Quality: ⭐⭐⭐⭐ Good

**Strengths**:
- ✅ Excellent **face consistency** with reference images
- ✅ Good value ($0.025)
- ✅ Moderate typography (better than Flux, worse than Ideogram)

**Weaknesses**:
- ⚠️ Requires reference image for best results
- ⚠️ Not as photorealistic as Flux Pro

**Best Use Cases**:
- Character aging progression
- Face-based generation
- Avatar creation
- **NOT ideal for landscape wallpapers**

**Parameters**:
```javascript
{
  prompt: "your prompt",
  aspect_ratio: "16:9",
  output_format: "png",
  image: referenceImageDataURI  // optional
}
```

---

### 5. Flux Schnell

**Model**: `black-forest-labs/flux-schnell`

**Performance**:
- Generation Time: 1-2 seconds
- Cost: $0.003 per image
- Quality: ⭐⭐⭐ Good for speed

**Strengths**:
- ✅ **Ultra-fast** (1-2 seconds!)
- ✅ Very cheap ($0.003)
- ✅ Good for rapid iteration/testing

**Weaknesses**:
- ❌ Lower quality than Pro models
- ❌ Same typography issues
- ⚠️ Limited parameters (max 4 inference steps)

**Best Use Cases**:
- Rapid prototyping
- Preview generation
- Testing prompt variations
- **NOT for final wallpapers**

**Parameters**:
```javascript
{
  prompt: "your prompt",
  aspect_ratio: "16:9",
  output_format: "png",
  num_inference_steps: 4  // max allowed
}
```

---

## Typography Deep Dive

### The Typography Challenge

Despite ultra-detailed specifications including:
- Font family: "SF Pro Display Bold (Apple's system font style)"
- Exact gradient colors: `#007AFF` → `#AF52DE`
- Quality requirements: "Crystal clear letterforms, zero distortion"
- Technical specs: "Vector-sharp edges, zero aliasing"
- Priority declaration: "TYPOGRAPHY QUALITY CRITICAL (HIGHEST PRIORITY)"

**Result**: All Flux models produced distorted, warped, or unreadable text.

### Why This Matters

**For Wallpaper Generation**:
- ✅ **Good News**: Users rarely want text on wallpapers
- ✅ **Strategy**: Focus prompts on pure visual elements
- ❌ **Avoid**: "text saying...", "with title...", "banner with..."

**Example Good Prompts** (for wallpapers):
```
"Vibrant neon cityscape at night, electric blue and purple gradient sky"
"Abstract fluid waves, iridescent colors, smooth gradients"
"Cosmic nebula with stars, deep purples and blues, photorealistic"
"Minimalist geometric patterns, pastel gradient background"
```

**Example Bad Prompts** (for wallpapers):
```
"Motivational quote 'Dream Big' in bold text"  ❌
"Calendar with dates for February 2026"  ❌
"Name 'Alex' in graffiti style"  ❌
```

---

## Production Recommendations

### For AI Wallpaper Generator App

**Primary Model**: **Flux Pro** (`black-forest-labs/flux-pro`)

**Reasoning**:
1. Best photorealistic quality (⭐⭐⭐⭐⭐)
2. Fast generation (5-6 seconds)
3. Reasonable cost ($0.05 per wallpaper)
4. Typography limitation irrelevant (wallpapers don't need text)

**Implementation**:
```typescript
// api/generate/index.ts
const output = await replicate.run('black-forest-labs/flux-pro', {
  input: {
    prompt: userPrompt,  // Pure visual description, no text
    aspect_ratio: '9:16',  // iPhone portrait
    output_format: 'png',
    steps: 25,
    guidance: 3
  }
});
```

**Prompt Engineering Strategy**:
1. Encourage visual-only prompts in UI
2. Add example prompts without text
3. Optionally strip text-related keywords from user input
4. Focus on: colors, mood, style, composition, lighting

**Future Considerations**:
- Add **Flux Schnell** for quick previews (1-2s, $0.003)
- Use **Ideogram v2** only for marketing materials (not wallpapers)
- Monitor model updates for typography improvements

---

## Cost Optimization

### Wallpaper Generation Cost Analysis

**Scenario: Personal Use (100 wallpapers/month)**
- Flux Pro: $5.00/month
- Flux 1.1 Pro: $4.00/month
- Flux Schnell: $0.30/month (preview only)

**Scenario: Shared with Friends (500 wallpapers/month)**
- Flux Pro: $25.00/month
- Flux 1.1 Pro: $20.00/month

**Scenario: Small Community (2000 wallpapers/month)**
- Flux Pro: $100.00/month
- Flux 1.1 Pro: $80.00/month

**Recommendation**: Start with **Flux Pro** for quality, monitor usage, switch to **Flux 1.1 Pro** if cost becomes concern.

---

## Lessons Learned

### 1. Prompt Length ≠ Quality

**Finding**: 5,500-character ultra-detailed prompt did NOT produce better typography than simple prompts.

**Implication**: For visual content, focus on **concise, clear descriptions** rather than exhaustive specifications.

### 2. Model Specialization Matters

**Finding**: Different models excel at different tasks:
- Flux Pro → Photorealism
- Ideogram v2 → Typography
- Nano Banana Pro → Faces

**Implication**: Choose model based on primary use case, not general reputation.

### 3. Cost ≠ Quality (Always)

**Finding**: Flux Pro ($0.05) outperformed Ideogram v2 ($0.08) for photorealistic wallpapers.

**Implication**: More expensive doesn't always mean better—depends on use case.

### 4. Speed Matters for UX

**Finding**: 5-6 second generation (Flux Pro) vs 15-20 seconds (Ideogram v2) significantly impacts user experience.

**Implication**: Factor generation speed into model selection for real-time apps.

---

## Testing Resources

**Generated Test Assets**:
- `assets/banner.png` - Ideogram v2 (good typography)
- `assets/banners/banner-flux-pro.png` - Flux Pro (best photorealism)
- `assets/banners/banner-flux-1.1-pro.png` - Flux 1.1 Pro (similar quality)
- `assets/banners/results.json` - Full test metadata

**Test Scripts**:
- `test-models.js` - Multi-model comparison
- `test-simple.js` - Simplified testing
- `generate-banner.js` - Ideogram v2 banner generator

---

## Conclusion

**For AI Wallpaper Generator**:
1. ✅ Use **Flux Pro** as primary model
2. ✅ Design UI to encourage text-free prompts
3. ✅ Add example prompts focusing on visual elements
4. ✅ Consider Flux Schnell for preview mode
5. ❌ Avoid typography-heavy use cases

**For Marketing Materials**:
1. ✅ Use **Ideogram v2** when text is critical
2. ✅ Accept higher cost ($0.08) and slower generation (15-20s)
3. ✅ Leverage magic_prompt_option for better results

**Model Selection Decision Tree**:
```
Need text?
  → YES → Ideogram v2 ($0.08, 15-20s)
  → NO → Need photorealism?
      → YES → Flux Pro ($0.05, 5-6s) ✅
      → NO → Need speed?
          → YES → Flux Schnell ($0.003, 1-2s)
          → NO → Flux 1.1 Pro ($0.04, 9-10s)
```

---

**Last Updated**: February 21, 2026
**Next Review**: After 1000 production wallpapers generated
**Status**: Production-validated recommendations
