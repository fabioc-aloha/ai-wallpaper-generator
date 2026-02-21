import Replicate from 'replicate';
import https from 'https';
import fs from 'fs-extra';

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN environment variable is required');
  process.exit(1);
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const BANNER_PROMPT = `Professional ultra-wide technology banner (16:9 aspect ratio).

CENTER: Photorealistic iPhone 16 Pro in Natural Titanium, front view at 15° angle.
- Display shows vibrant neon cityscape wallpaper with blue/purple gradient sky
- Dynamic Island visible at top
- Three-camera system on back
- Studio product photography lighting

LEFT SIDE: Large bold text "AI WALLPAPER GENERATOR"
- Gradient from electric blue to vibrant purple
- Clean sans-serif font, crystal clear
- Below it: "iPhone • Azure • Replicate AI" in white

BACKGROUND: Deep navy to midnight blue gradient with subtle stars and particles

STYLE: Premium Apple keynote quality, photorealistic 3D rendering, HDR color grading`;

// Test models with potential typography strengths
const MODELS = [
  {
    id: 'flux-schnell',
    name: 'Flux Schnell (Nano)',
    model: 'black-forest-labs/flux-schnell',
    params: {
      prompt: BANNER_PROMPT,
      aspect_ratio: '16:9',
      output_format: 'png',
      num_inference_steps: 4,
    },
    estimatedCost: '$0.003',
    description: 'Ultra-fast lightweight model (1-2 seconds)'
  },
  {
    id: 'ideogram-v2',
    name: 'Ideogram v2 (Banana)',
    model: 'ideogram-ai/ideogram-v2',
    params: {
      prompt: BANNER_PROMPT,
      aspect_ratio: '16:9',
      output_format: 'png',
      magic_prompt_option: 'Auto',
    },
    estimatedCost: '$0.08',
    description: 'Best-in-class typography and text rendering'
  },
  {
    id: 'nano-banana-pro',
    name: 'Google Imagen 3 (Nano Banana Pro)',
    model: 'google/nano-banana-pro',
    params: {
      prompt: BANNER_PROMPT,
      aspect_ratio: '16:9',
      output_format: 'png',
    },
    estimatedCost: '$0.025',
    description: 'Google Imagen 3 - advanced image generation with face consistency'
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
    
    // Extract image URL
    let imageUrl;
    if (typeof output === 'string') {
      imageUrl = output;
    } else if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (output && typeof output === 'object') {
      // Handle Ideogram's getter function
      imageUrl = typeof output.url === 'function' ? output.url() : output.url;
      if (!imageUrl && output[0]) {
        imageUrl = typeof output[0].url === 'function' ? output[0].url() : output[0];
      }
    }
    
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
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

async function runTests() {
  console.log('🚀 Testing Nano (Schnell) + Banana (Ideogram) + Google Imagen 3 (Nano Banana Pro)\n');
  console.log('════════════════════════════════════════════════════════════\n');
  
  const results = [];
  
  for (const model of MODELS) {
    const result = await testModel(model);
    results.push(result);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log('════════════════════════════════════════════════════════════\n');
  console.log('📊 RESULTS SUMMARY\n');
  
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
  
  // Save results
  await fs.writeJson('assets/banners/results-typography-test.json', results, { spaces: 2 });
  console.log('📝 Results saved to assets/banners/results-typography-test.json\n');
}

runTests().catch(console.error);
