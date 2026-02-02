#!/usr/bin/env node

/**
 * Extract frames from video using ffmpeg
 * Usage: node extract_frames.js [video_path] [output_dir] [frame_count]
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get command line arguments
const videoPath = process.argv[2] || './assets/video/vid2.mp4';
const outputDir = process.argv[3] || './assets/video/vid2_frames';
const frameCount = parseInt(process.argv[4]) || 60;

// Check if ffmpeg is available
try {
    execSync('ffmpeg -version', { stdio: 'ignore' });
} catch (error) {
    console.error('Error: ffmpeg is not installed or not in PATH');
    console.error('Please install ffmpeg: https://ffmpeg.org/download.html');
    process.exit(1);
}

// Check if video file exists
if (!fs.existsSync(videoPath)) {
    console.error(`Error: Video file not found: ${videoPath}`);
    process.exit(1);
}

// Create output directory
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`Created output directory: ${outputDir}`);
}

// Get video duration
console.log('Getting video duration...');
const durationOutput = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`, {
    encoding: 'utf-8'
});
const duration = parseFloat(durationOutput.trim());
console.log(`Video duration: ${duration.toFixed(2)}s`);

// Calculate frame interval
const interval = duration / (frameCount - 1);
console.log(`Extracting ${frameCount} frames at ${interval.toFixed(2)}s intervals...`);

// Extract frames using ffmpeg
// Using select filter to extract frames at specific times
const frameTimes = [];
for (let i = 0; i < frameCount; i++) {
    frameTimes.push((duration / (frameCount - 1)) * i);
}

// Build ffmpeg command
// Method 1: Extract frames at specific timestamps (more accurate)
const timestamps = frameTimes.map(t => t.toFixed(3)).join(',');
const outputPattern = path.join(outputDir, 'frame_%03d_%s.jpg');

console.log('Extracting frames...');
try {
    // Use select filter to extract frames at specific times
    // This is more efficient than seeking multiple times
    const command = `ffmpeg -i "${videoPath}" -vf "select='${frameTimes.map((t, i) => `between(t,${t-0.01},${t+0.01})`).join('+')}'" -vsync 0 -frame_pts 1 "${outputPattern}" -y`;
    
    // Alternative simpler approach: extract frames evenly spaced
    const simpleCommand = `ffmpeg -i "${videoPath}" -vf "fps=1/${interval}" -frames:v ${frameCount} -q:v 2 "${path.join(outputDir, 'frame_%03d.jpg')}" -y`;
    
    console.log('Running ffmpeg...');
    execSync(simpleCommand, { stdio: 'inherit' });
    
    // Rename files with timestamps
    const files = fs.readdirSync(outputDir)
        .filter(f => f.startsWith('frame_') && f.endsWith('.jpg'))
        .sort();
    
    console.log(`\nExtracted ${files.length} frames:`);
    files.forEach((file, index) => {
        const time = frameTimes[index];
        const newName = `frame_${String(index).padStart(3, '0')}_${time.toFixed(2)}s.jpg`;
        const oldPath = path.join(outputDir, file);
        const newPath = path.join(outputDir, newName);
        fs.renameSync(oldPath, newPath);
        console.log(`  ${newName}`);
    });
    
    console.log(`\n✅ Successfully extracted ${files.length} frames to ${outputDir}`);
    
} catch (error) {
    console.error('Error extracting frames:', error.message);
    process.exit(1);
}
