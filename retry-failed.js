import Replicate from 'replicate';
import https from 'https';
import fs from 'fs-extra';

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN environment variable is required');
  process.exit(1);
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const BANNER_PROMPT = `Ultra-premium technology product banner for AI Wallpaper Generator app (3:1 ultra-wide format, 1536x512).

CRITICAL TYPOGRAPHY (must be crystal clear):
Title text (large, left-aligned, upper third):
"AI WALLPAPER GENERATOR"
- Font: SF Pro Display Bold (Apple's system font style), all caps
- Size: Very large, dominant
- Color: Gradient from electric blue (#007AFF) to vibrant purple (#AF52DE)
- Effect: Subtle inner glow, perfectly sharp edges
- Quality: Crystal clear letterforms, zero distortion

Subtitle (below title, smaller):
"iPhone • Azure • Replicate AI"
- Font: SF Pro Text Regular (clean sans-serif)
- Color: Soft white (#F5F5F7) with 90% opacity
- Perfect readability

HERO PRODUCT (center-right, dominant focal point):
iPhone 16 Pro in Natural Titanium finish:
- EXACT MODEL: iPhone 16 Pro, 6.3" display
- Front view at 15° angle showing full screen
- Dynamic Island clearly visible at top (pill-shaped cutout)
- Screen content: Stunning AI-generated wallpaper showing:
  * Vibrant neon cityscape at night
  * Electric blue, purple, pink gradient sky
  * Detailed futuristic buildings with glow
  * Ultra-sharp, vivid colors
- Materials:
  * Aerospace-grade titanium frame (brushed metal texture)
  * Ceramic Shield glass (slight reflection)
  * Camera bump visible (three lenses + LiDAR)
  * Perfect edge-to-edge display with thin bezels
- Lighting on device:
  * Studio product photography quality
  * Soft key light from upper left
  * Rim light on titanium edges (blue-white)
  * Screen glow illuminating surroundings
  * Subtle reflection on glass surface
- Realism: Photorealistic Apple product photography standard

APPLE BRANDING (subtle, professional):
- Small Apple logo (clean, monochrome white)
- Position: Top right corner, small scale
- Style: Official Apple logo silhouette
- Glow: Very subtle white outline

TECHNOLOGY BADGES (left side, vertical stack):
Position: Left edge, centered vertically
Each badge: Clean icon + text label, modern tech style

1. Azure Badge:
   - Icon: Microsoft Azure cloud symbol (blue #0078D4)
   - Text: "Azure" in white
   - Style: Flat modern icon, professional

2. Replicate Badge:
   - Icon: AI/ML neural network symbol (orange #FF6B35)
   - Text: "Replicate" in white
   - Style: Geometric abstract, tech-forward

3. PWA Badge:
   - Icon: Progressive web app symbol (purple #7C3AED)
   - Text: "PWA" in white
   - Style: Modern web technology icon

Badge layout:
- Vertical alignment, equal spacing
- Each badge: Icon (left) + Text (right)
- Background: Subtle frosted glass effect (10% white, 5% blur)
- Border: 1px white 20% opacity
- Size: Compact, professional, not competing with main content

BACKGROUND COMPOSITION (3:1 ultra-wide):
Gradient layers:
- Base: Deep space navy (#0A0E1A) at edges
- Mid: Rich midnight blue (#141B2D) 
- Accent: Deep purple tint (#1A0B2E) on right side
- Transition: Smooth radial gradients, no banding

Atmospheric elements:
- Scattered tiny stars (various sizes, white, 30-70% opacity)
- Floating abstract particles (blue, purple, cyan)
- Soft bokeh circles (out of focus light orbs)
- Subtle noise texture (2% for depth)
- Neural network pattern (faint lines, barely visible in background)

Depth layers:
- Background: Dark gradient + stars (furthest)
- Mid-ground: Particles and badges
- Foreground: iPhone (closest, sharpest)
- Typography: Overlaid on everything, perfectly sharp

LIGHTING SETUP (studio product photography):
Key light:
- Source: Upper left, 45° angle
- Color: Cool white (#FFFFFF) with slight blue tint
- Intensity: Bright but not harsh
- Effect: Defines iPhone shape, creates subtle shadows

Rim light:
- Source: Right edge, behind subject
- Color: Electric blue (#00D4FF)
- Intensity: Medium
- Effect: Separates iPhone from background, glows on titanium edges

Fill light:
- Source: Front, soft diffused
- Color: Neutral (#F0F0F0)
- Intensity: Low
- Effect: Reduces harsh shadows, shows detail

Screen glow:
- Source: iPhone display itself
- Color: Multi-colored from wallpaper (blue, purple, pink)
- Intensity: Medium-high
- Effect: Illuminates nearby area, casts colored light on frame

Ambient:
- Particles have individual glows
- Badges have subtle inner glow
- Typography has soft glow effect
- Overall: Premium, polished, professional

COLOR PALETTE (Apple-inspired):
Primary:
- Deep Navy: #0A0E1A (background base)
- Midnight Blue: #141B2D (gradient mid)
- iOS Blue: #007AFF (text gradient start)
- Purple: #AF52DE (text gradient end)

Accents:
- Azure Blue: #0078D4 (badge)
- Replicate Orange: #FF6B35 (badge)
- PWA Purple: #7C3AED (badge)
- Cyan Glow: #00D4FF (rim lighting)

Neutrals:
- Pure White: #FFFFFF (Apple logo, text)
- Soft White: #F5F5F7 (subtitle)
- Titanium: #E5E5EA (iPhone frame)

STYLE & QUALITY REQUIREMENTS:
- Photorealistic 3D product rendering (Apple keynote quality)
- Ray-traced lighting and reflections
- Physically accurate materials (metal, glass, light)
- Tack-sharp focus on iPhone and typography
- Cinematic depth of field (slight blur on background particles)
- HDR color grading (vibrant but natural)
- Clean, minimal, premium aesthetic
- Professional software/tech product branding
- Zero visual clutter - every element intentional
- Apple design philosophy: simplicity, clarity, elegance

TECHNICAL SPECIFICATIONS:
- Resolution: Ultra-sharp, suitable for 1536x512 or higher
- Aspect ratio: 3:1 (width 3x height)
- Format: PNG with transparency support where needed
- Color space: sRGB, wide gamut where possible
- Typography: Vector-sharp edges, zero aliasing
- iPhone render: Product photography quality, perfect geometry
- Badges: Clean vector style icons
- Gradients: Smooth, no banding artifacts

TYPOGRAPHY QUALITY CRITICAL (HIGHEST PRIORITY):
- "AI WALLPAPER GENERATOR" must be PERFECTLY readable
- Zero text distortion, warping, or artifacts
- Sharp letterforms like vector graphics
- Proper letter spacing and kerning
- Gradient must be smooth across letters
- Each letter must be complete and correct spelling
- No merged letters, no missing parts
- Crystal clear at any viewing distance

PRODUCT ACCURACY CRITICAL:
- iPhone 16 Pro must look like official Apple product photo
- Dynamic Island exact shape and position
- Three-camera system correct layout
- Titanium finish realistic material rendering
- Screen-to-body ratio accurate
- No generic "smartphone" - must be recognizable as iPhone 16 Pro

MOOD & MESSAGE:
Innovation meets elegance. Cutting-edge AI technology wrapped in Apple's premium design language. Professional yet approachable. Inspires creativity and possibility. Shows that powerful AI wallpaper generation can be beautiful, simple, and sophisticated. Tech-forward but human-centered.`;

// Only retry the 3 failed models - using proven alternatives
const RETRY_MODELS = [
  {
    id: 'sdxl',
    name: 'Stable Diffusion XL',
    model: 'stability-ai/sdxl',
    params: {
      prompt: BANNER_PROMPT,
      width: 1536,
      height: 640,
      num_inference_steps: 50,
      guidance_scale: 7.5,
    },
    estimatedCost: '$0.005',
    description: 'Industry standard - reliable high-quality generation'
  },
  {
    id: 'recraft-v3',
    name: 'Recraft V3',
    model: 'recraft-ai/recraft-v3',
    params: {
      prompt: BANNER_PROMPT,
      size: '2048x1024',
      style: 'realistic_image',
    },
    estimatedCost: '$0.01',
    description: 'State-of-the-art realistic rendering and typography'
  },
  {
    id: 'ideogram-v2-turbo',
    name: 'Ideogram v2 Turbo',
    model: 'ideogram-ai/ideogram-v2-turbo',
    params: {
      prompt: BANNER_PROMPT,
      aspect_ratio: '16:9',
      output_format: 'png',
      magic_prompt_option: 'AUTO',
    },
    estimatedCost: '$0.04',
    description: 'Fast Ideogram variant - excellent for product/typography'
  },
];

async function downloadImage(url, filepath) {
  await fs.ensureDir('assets/banners');
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath);
      reject(err);
    });
  });
}

async function testModel(modelConfig) {
  console.log(`🎨 Testing: ${modelConfig.name}`);
  console.log(`   Model: ${modelConfig.model}`);
  console.log(`   Cost: ${modelConfig.estimatedCost}`);
  
  const startTime = Date.now();
  
  try {
    const output = await replicate.run(modelConfig.model, { input: modelConfig.params });
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    // Extract image URL (handle different output formats)
    let imageUrl;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (output && typeof output === 'object' && output.url) {
      imageUrl = output.url;
    } else {
      throw new Error('Unexpected output format');
    }
    
    const filename = `assets/banners/banner-${modelConfig.id}.png`;
    await downloadImage(imageUrl, filename);
    
    console.log(`   ✅ Generated in ${generationTime}s`);
    console.log(`   💾 Saved to ${filename}\n`);
    
    return {
      ...modelConfig,
      imageUrl,
      generationTime: `${generationTime}s`,
      filename,
      success: true,
    };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}\n`);
    return {
      ...modelConfig,
      error: error.message,
      success: false,
    };
  }
}

async function retryFailedModels() {
  console.log('🔄 Retrying 3 failed models with fixes\n');
  console.log('════════════════════════════════════════════════════════════\n');
  
  const results = [];
  
  for (const model of RETRY_MODELS) {
    const result = await testModel(model);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('════════════════════════════════════════════════════════════\n');
  console.log('📊 RETRY RESULTS\n');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successful: ${successful.length}/${results.length}`);
  console.log(`❌ Failed: ${failed.length}/${results.length}\n`);
  
  if (successful.length > 0) {
    console.log('Generated banners:');
    successful.forEach(r => {
      console.log(`  • ${r.name}: ${r.filename} (${r.generationTime})`);
    });
    console.log();
  }
  
  if (failed.length > 0) {
    console.log('Failed generations:');
    failed.forEach(r => {
      console.log(`  • ${r.name}: ${r.error}`);
    });
    console.log();
  }
  
  // Update results.json with new results
  const existingResults = await fs.readJson('assets/banners/results.json');
  
  // Merge new results with existing ones
  for (const newResult of results) {
    const existingIndex = existingResults.findIndex(r => r.id === newResult.id);
    if (existingIndex >= 0) {
      existingResults[existingIndex] = newResult;
    } else {
      existingResults.push(newResult);
    }
  }
  
  await fs.writeJson('assets/banners/results.json', existingResults, { spaces: 2 });
  
  console.log('📝 Updated assets/banners/results.json\n');
}

retryFailedModels().catch(console.error);
