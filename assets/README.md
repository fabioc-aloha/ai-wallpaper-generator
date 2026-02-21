# Banner Options

This project uses a professional SVG banner located at [assets/banner.svg](assets/banner.svg).

## Current Banner (SVG)

**Features**:
- ✅ Instant loading, no HTTP requests
- ✅ Scalable to any resolution
- ✅ Animated elements (particles, color cycling)
- ✅ Matches GitHub dark theme
- ✅ No API costs
- ✅ Version controlled

**Technologies**:
- SVG with CSS animations
- GitHub Primer color palette
- iPhone 16 Pro mockup with Dynamic Island
- Azure, PWA, and Replicate branding badges

---

## AI-Generated Alternative (Future)

If you want to create a photorealistic AI-generated banner using Replicate:

### Prerequisites

```bash
# Install dependencies
npm install replicate

# Set API key
export REPLICATE_API_TOKEN="r8_your_token_here"
```

### Generate Banner

```bash
node generate-banner.js
```

This uses **Ideogram v2** for crystal-clear typography rendering.

**Cost**: ~$0.08 per generation
**Resolution**: 1536×512 (3:1 ultra-wide)
**Model**: `ideogram-ai/ideogram-v2`

### Prompt Details

See `.banner-prompt.md` for the complete generation prompt with:
- Title text specification
- Visual composition
- Lighting and color palette
- iPhone 16 Pro mockup details
- Background and mood specifications

---

## Comparison

| Aspect | SVG (Current) | AI-Generated |
|--------|---------------|--------------|
| **Cost** | Free | $0.08 |
| **Load Time** | Instant | HTTP request |
| **Scalability** | Perfect | Limited to 1536×512 |
| **Customization** | Easy (edit SVG) | Requires regeneration |
| **Animation** | Native CSS | Static image |
| **Quality** | Clean, professional | Photorealistic |
| **Best For** | Technical projects | Product/brand marketing |

---

## Updating the Banner

### SVG Version

Edit `assets/banner.svg` directly:
- Change colors in gradients
- Modify text
- Adjust animations
- Add/remove elements

### AI Version

1. Edit `.banner-prompt.md`
2. Run `node generate-banner.js`
3. Download generated image
4. Replace `assets/banner.svg` or add as `assets/banner.png`
5. Update README.md image reference

---

**Current Choice**: SVG banner for instant loading, no dependencies, and full control.
