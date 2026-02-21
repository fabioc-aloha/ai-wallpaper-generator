import Replicate from 'replicate';
import https from 'https';
import fs from 'fs-extra';

if (!process.env.REPLICATE_API_TOKEN) {
  console.error('REPLICATE_API_TOKEN environment variable is required');
  process.exit(1);
}

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

const SIMPLE_PROMPT = `Professional banner for AI Wallpaper Generator app. 
iPhone 16 Pro showing colorful wallpaper, clean text "AI WALLPAPER GENERATOR", 
gradient blue to purple background, modern tech aesthetic.`;

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

async function testModel(name, model, params, cost) {
  console.log(`\n🎨 Testing: ${name}`);
  console.log(`   Model: ${model}`);
  console.log(`   Cost: ${cost}`);
  
  const startTime = Date.now();
  
  try {
    console.log(`   ⏳ Running...`);
    const output = await replicate.run(model, { input: params });
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(`   📦 Full output:`, output);
    console.log(`   📦 Output keys:`, Object.keys(output || {}));
    console.log(`   📦 Output type: ${typeof output}`);
    console.log(`   📦 Is Array: ${Array.isArray(output)}`);
    
    // Wait for the prediction to complete if it's still processing
    let imageUrl = null;
    
    if (typeof output === 'string' && output.startsWith('http')) {
      imageUrl = output;
    } else if (Array.isArray(output) && output.length > 0) {
      imageUrl = typeof output[0] === 'string' ? output[0] : output[0]?.url;
    } else if (output && typeof output === 'object') {
      imageUrl = output.url || output.output || output.image;
    }
    
    if (!imageUrl) {
      throw new Error(`Could not extract image URL from output: ${JSON.stringify(output)}`);
    }
    
    const filename = `assets/banners/banner-${name.toLowerCase().replace(/\s+/g, '-')}.png`;
    await downloadImage(imageUrl, filename);
    
    console.log(`   ✅ Generated in ${generationTime}s`);
    console.log(`   💾 Saved to ${filename}`);
    
    return { success: true, filename, generationTime, imageUrl };
  } catch (error) {
    console.log(`   ❌ Failed: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runTests() {
  console.log('🚀 Testing AI Image Generation Models\n');
  console.log('═'.repeat(60));
  
  // Test Google Imagen 3 (nano-banana-pro)
  await testModel(
    'Google Imagen 3',
    'google/nano-banana-pro',
    {
      prompt: SIMPLE_PROMPT,
      aspect_ratio: '16:9',
      output_format: 'png'
    },
    '$0.025'
  );
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Test Ideogram v2 
  await testModel(
    'Ideogram v2',
    'ideogram-ai/ideogram-v2',
    {
      prompt: SIMPLE_PROMPT,
      aspect_ratio: '16:9',
      output_format: 'png',
      magic_prompt_option: 'Auto'
    },
    '$0.08'
  );
  
  await new Promise(r => setTimeout(r, 2000));
  
  // Test Flux Pro
  await testModel(
    'Flux Pro',
    'black-forest-labs/flux-pro',
    {
      prompt: SIMPLE_PROMPT,
      aspect_ratio: '16:9',
      output_format: 'png',
      steps: 25,
      guidance: 3
    },
    '$0.05'
  );
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ Test complete! Check assets/banners/ folder\n');
}

runTests().catch(console.error);
