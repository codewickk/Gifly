const express = require('express');
const { z } = require('zod'); 
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const GIFEncoder = require("gif-encoder-2");
const { createCanvas, loadImage } = require("canvas");
const sharp = require("sharp");
const cors = require('cors'); 
const archiver = require('archiver'); 
const app = express();
const port = process.env.PORT || 3000;

// Dynamic CORS for Render deployment
const corsOptions = {
    origin: [
        'https://gifly-1.onrender.com', // Frontend on Render
        'http://localhost:5173'        // For local testing
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

app.use(express.json());


const inputSchema = z.object({
    url: z.string().url()
});
app.get('/test', (req, res) => {
    res.json({ message: 'Backend is working!' });
  });

app.post('/generateTandGIF', async (req, res) => {
   console.log("the route works properly")
    const inputUrl = req.body.url;
    
    const options = req.body.options || {};

    console.log(`Processing request with URL: ${inputUrl}`);
    console.log(`Options received:`, options);

    if (!inputUrl) {
        console.log('Missing URL in request body:', req.body);
        return res.status(400).json({ message: 'Missing url in request body' });
    }

    const validationResult = inputSchema.safeParse({ url: inputUrl });

    if (!validationResult.success) {
        console.log('URL validation failed:', validationResult.error.errors);
        return res.status(403).json({
            message: 'You have entered an invalid URL',
            error: validationResult.error.errors
        });
    }
    
    console.log(`Processing URL: ${inputUrl}`);
    
    try {
       
        const isAccessible = await isUrlAccessible(inputUrl);
        if (!isAccessible) {
            return res.status(400).json({
                message: 'Unable to access the provided URL. The site might be blocking automated access.'
            });
        }

     
        const outputDir = './output';
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const heroOutputPath = path.join(outputDir, 'hero-section.png');
        const gifOutputPath = path.join(outputDir, 'website-smooth-scroll.gif');
        
       
        await processWebsite(inputUrl, {
            captureHero: true,
            heroOutputPath,
            heroHeight: 800,
            
            captureScrollingGif: true,
            gifOutputPath,
            
           
            width: 1920,
            height: 1080,
            fps: 15,
            scrollStep: options.scrollStep || 10,
            quality: 10,
            maxFrames: 120,
            scaleFactor: 0.5
        });
        
     
        const fullHeroPath = path.resolve(heroOutputPath);
        const fullGifPath = path.resolve(gifOutputPath);
        
        console.log(`Processing completed. Files generated at:`, {
            heroImage: fullHeroPath,
            scrollingGif: fullGifPath
        });
        
        res.json({
            message: "Processing completed successfully",
            url: inputUrl,
            outputs: {
                heroImage: '/output/hero-section.png',
                scrollingGif: '/output/website-smooth-scroll.gif'
            }
        });
    } catch (error) {
        console.error('Detailed error processing website:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: 'Error processing website',
            error: error.message
        });
    }
});


app.get('/download/:type', (req, res) => {
    const { type } = req.params;
    const asZip = req.query.zip === 'true';
    
    const heroPath = path.join(__dirname, 'output', 'hero-section.png');
    const gifPath = path.join(__dirname, 'output', 'website-smooth-scroll.gif');
    
 
    if (!fs.existsSync(heroPath) || !fs.existsSync(gifPath)) {
        return res.status(404).json({ message: 'Files not found. Generate them first.' });
    }
    
 
    if (asZip) {
        res.attachment('website-assets.zip');
        
        const archive = archiver('zip', {
            zlib: { level: 9 } 
        });
        
       
        archive.pipe(res);
        
        
        archive.file(heroPath, { name: 'website-thumbnail.png' });
        archive.file(gifPath, { name: 'website-animation.gif' });
        
        archive.finalize();
        return;
    }
    
   
    if (type === 'image') {
        res.download(heroPath, 'website-thumbnail.png');
    } else if (type === 'gif') {
        res.download(gifPath, 'website-animation.gif');
    } else {
        res.status(400).json({ message: 'Invalid download type' });
    }
});


async function isUrlAccessible(url) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
            args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto(url, { timeout: 15000 });
        await browser.close();
        return true;
    } catch (error) {
        console.error(`URL accessibility check failed: ${error.message}`);
        return false;
    }
}


async function captureHeroSection(url, outputFile, options = {}) {
    const {
        width = 1920,
        height = 1080,
        heroHeight = 800
    } = options;
    
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
    });
    
    
    const page = await browser.newPage();
    await page.setViewport({ width, height });
    
    try {
        console.log(`Navigating to ${url}...`);
       
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        

        await new Promise(resolve => setTimeout(resolve, 2000));
        
        await page.screenshot({
            path: outputFile,
            clip: {
                x: 0,
                y: 0,
                width: width,
                height: heroHeight
            }
        });
        
        console.log(`Hero section screenshot saved to: ${outputFile} (${width}x${heroHeight}px)`);
    } catch (error) {
        console.error('Error capturing hero section:', error);
        console.error('Error stack:', error.stack);
        throw error;
    } finally {
        await browser.close();
    }
}


async function captureScrollingGif(url, outputFile, options = {}) {
    const {
        width = 1920,
        height = 1080,
        fps = 15,
        quality = 10,
        repeat = 0,
        maxFrames = 120,
        scaleFactor = 0.5
    } = options;
    
 
    let { scrollStep = 10 } = options;

    console.log(`Starting GIF capture with scroll step: ${scrollStep}`);

  
    const scaledWidth = Math.floor(width * scaleFactor);
    const scaledHeight = Math.floor(height * scaleFactor);

    
    const tempDir = './temp-frames';
    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
    }

  
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
         executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || puppeteer.executablePath(),
        args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
   
    await page.setViewport({ width, height });
    
    try {
        console.log(`Navigating to ${url}...`);
      
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        
       
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        
        const fullPageHeight = await page.evaluate(() => {
            return Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.offsetHeight
            );
        });
        
        console.log(`Full page height: ${fullPageHeight}px`);
        
        
        if (fullPageHeight <= height) {
            console.log("Page is too short for scrolling GIF. Taking a single screenshot instead.");
            
            const singleFramePath = path.join(tempDir, `frame00000.png`);
            await page.screenshot({ path: singleFramePath });
            
          
            await processFramesAndCreateGif(
                [singleFramePath], 
                outputFile, 
                scaledWidth, 
                scaledHeight, 
                width, 
                height, 
                fps, 
                quality, 
                repeat,
                scaleFactor
            );
            
            console.log(`Single frame GIF created successfully: ${outputFile}`);
            
          
            if (fs.existsSync(singleFramePath)) fs.unlinkSync(singleFramePath);
            if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
            
            await browser.close();
            return;
        }
        
        
        const totalScrollDistance = fullPageHeight - height;
        let totalFrames = Math.ceil(totalScrollDistance / scrollStep);
        
   
        if (totalFrames > maxFrames) {
            
            scrollStep = Math.ceil(totalScrollDistance / maxFrames);
            totalFrames = Math.ceil(totalScrollDistance / scrollStep);
            console.log(`Limiting to ${totalFrames} frames with adjusted scroll step: ${scrollStep}px`);
        } else {
            console.log(`Capturing ${totalFrames} frames with scroll step: ${scrollStep}px`);
        }

       
        const framePaths = [];
        let currentPosition = 0;
        
        for (let frameCount = 0; currentPosition <= totalScrollDistance; frameCount++) {
            
            await page.evaluate((scrollPos) => {
                window.scrollTo(0, scrollPos);
            }, currentPosition);

         
            await new Promise(resolve => setTimeout(resolve, 200));
            
           
            const framePath = path.join(tempDir, `frame${frameCount.toString().padStart(5, '0')}.png`);
            await page.screenshot({ path: framePath });
            framePaths.push(framePath);
            
            if (frameCount % 10 === 0 || frameCount === totalFrames - 1) {
                console.log(`Captured frame ${frameCount + 1}/${totalFrames} (Position: ${currentPosition}/${totalScrollDistance})`);
            }
            
            currentPosition += scrollStep;
        }
        
        console.log(`All ${framePaths.length} frames captured. Processing and creating GIF...`);
        
      
        await processFramesAndCreateGif(
            framePaths, 
            outputFile, 
            scaledWidth, 
            scaledHeight, 
            width, 
            height, 
            fps, 
            quality, 
            repeat,
            scaleFactor
        );
        
        console.log(`GIF created successfully: ${outputFile}`);
        
    
        console.log("Cleaning up temporary files...");
        for (const frame of framePaths) {
            if (fs.existsSync(frame)) fs.unlinkSync(frame);
        }
        if (fs.existsSync(tempDir)) fs.rmdirSync(tempDir);
        
    } catch (error) {
        console.error('Detailed error capturing scrolling gif:', error);
        console.error('Error stack:', error.stack);
        throw error;
    } finally {
        await browser.close();
    }
}

async function processFramesAndCreateGif(
    framePaths, 
    outputFile, 
    scaledWidth, 
    scaledHeight, 
    originalWidth,
    originalHeight,
    fps, 
    quality, 
    repeat,
    scaleFactor
) {
    console.log("Processing frames and creating GIF...");
    
    try {
      
        if (framePaths.length === 0) {
            console.error("No frames to process");
            throw new Error("No frames captured");
        }
        
    
        const batchSize = 10;
        const resizedFrames = [];
        
        for (let i = 0; i < framePaths.length; i += batchSize) {
            const batch = framePaths.slice(i, i + batchSize);
            const batchPromises = batch.map(async (framePath, index) => {
                const resizedPath = framePath.replace('.png', '_resized.png');
                
                
                await sharp(framePath)
                    .resize(scaledWidth, scaledHeight)
                    .toFile(resizedPath);
                    
              
                fs.unlinkSync(framePath);
                
                return resizedPath;
            });
            
            const batchResults = await Promise.all(batchPromises);
            resizedFrames.push(...batchResults);
            console.log(`Processed batch ${Math.ceil((i + 1) / batchSize)}/${Math.ceil(framePaths.length / batchSize)}`);
        }
        
      
        const encoder = new GIFEncoder(scaledWidth, scaledHeight, 'neuquant', repeat, quality);
        encoder.setDelay(1000 / fps);
        encoder.start();

       
        const canvas = createCanvas(scaledWidth, scaledHeight);
        const ctx = canvas.getContext('2d');
        
       
        for (let i = 0; i < resizedFrames.length; i++) {
            const img = await loadImage(resizedFrames[i]);
            ctx.drawImage(img, 0, 0);
            encoder.addFrame(ctx);
            
            
            fs.unlinkSync(resizedFrames[i]);
            
            if (i % 10 === 0 || i === resizedFrames.length - 1) {
                console.log(`Added frame ${i+1}/${resizedFrames.length} to GIF`);
            }
        }
        
        
        encoder.finish();
        
        
        const buffer = encoder.out.getData();
        fs.writeFileSync(outputFile, buffer);
        
        console.log(`GIF size: ${(buffer.length / (1024 * 1024)).toFixed(2)} MB`);
    } catch (error) {
        console.error('Error processing frames:', error);
        console.error('Error stack:', error.stack);
        throw error;
    }
}


async function processWebsite(url, options = {}) {
    try {
      
        if (options.captureHero) {
            console.log(`Capturing hero section of ${url}`);
            await captureHeroSection(url, options.heroOutputPath || './hero-section.png', {
                width: options.width || 1920,
                height: options.height || 1080,
                heroHeight: options.heroHeight || 800
            });
        }
        
  
        if (options.captureScrollingGif) {
            console.log(`Starting optimized scrolling capture for ${url}`);
            await captureScrollingGif(url, options.gifOutputPath || './website-smooth-scroll.gif', {
                width: options.width || 1920,
                height: options.height || 1080,
                fps: options.fps || 15,
                scrollStep: options.scrollStep || 10,
                quality: options.quality || 10,
                maxFrames: options.maxFrames || 120,
                scaleFactor: options.scaleFactor || 0.5
            });
        }
        
        console.log('Process finished successfully!');
    } catch (error) {
        console.error('Process failed:', error);
        throw error; r
    }
}


app.use('/output', express.static(path.join(__dirname, 'output')));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});