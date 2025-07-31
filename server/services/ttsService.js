const gtts = require('gtts');
const fs = require('fs').promises;
const path = require('path');
const { spawn } = require('child_process');

class TTSService {
  constructor() {
    this.audioDir = path.join(__dirname, '../../uploads/audio');
    this.ensureAudioDir();
  }

  async ensureAudioDir() {
    try {
      await fs.mkdir(this.audioDir, { recursive: true });
    } catch (error) {
      console.error('Error creating audio directory:', error);
    }
  }

  async generateVoiceover(text, options = {}) {
    const {
      voice = 'en',
      rate = 1.0,
      pitch = 1.0,
      volume = 1.0,
      projectId = null
    } = options;

    try {
      console.log(`Generating voiceover for text: "${text.substring(0, 50)}..."`);
      console.log(`Voice: ${voice}, Rate: ${rate}, Pitch: ${pitch}, Volume: ${volume}`);

      // Generate a unique filename
      const filename = projectId ? `voiceover_${projectId}.mp3` : `voiceover_${Date.now()}.mp3`;
      const outputPath = path.join(this.audioDir, filename);

      // Use gtts to generate speech
      const gttsInstance = new gtts(text, voice);
      
      return new Promise((resolve, reject) => {
        gttsInstance.save(outputPath, (err) => {
          if (err) {
            console.error('TTS generation error:', err);
            reject(err);
            return;
          }

          console.log(`TTS audio generated: ${outputPath}`);

          // Apply audio effects using FFmpeg if needed
          if (rate !== 1.0 || pitch !== 1.0 || volume !== 1.0) {
            this.applyAudioEffects(outputPath, { rate, pitch, volume })
              .then(() => resolve(outputPath))
              .catch(reject);
          } else {
            resolve(outputPath);
          }
        });
      });
    } catch (error) {
      console.error('Voiceover generation failed:', error);
      throw error;
    }
  }

  async applyAudioEffects(audioPath, effects) {
    const { rate = 1.0, pitch = 1.0, volume = 1.0 } = effects;
    
    // Create temporary output path
    const tempPath = audioPath.replace('.mp3', '_temp.mp3');
    
    // Build FFmpeg command for audio effects
    const ffmpegArgs = [
      '-i', audioPath,
      '-filter:a', `atempo=${rate},asetrate=44100*${pitch},volume=${volume}`,
      '-y', tempPath
    ];

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      let stderr = '';
      
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ffmpeg.on('close', async (code) => {
        if (code === 0) {
          try {
            // Replace original file with processed file
            await fs.rename(tempPath, audioPath);
            console.log(`Audio effects applied: rate=${rate}, pitch=${pitch}, volume=${volume}`);
            resolve(audioPath);
          } catch (error) {
            reject(error);
          }
        } else {
          console.error('FFmpeg audio processing failed:', stderr);
          reject(new Error('Audio processing failed'));
        }
      });
    });
  }

  async getAudioDuration(audioPath) {
    return new Promise((resolve, reject) => {
      const ffprobe = spawn('ffprobe', [
        '-v', 'quiet',
        '-show_entries', 'format=duration',
        '-of', 'csv=p=0',
        audioPath
      ]);
      
      let stdout = '';
      let stderr = '';
      
      ffprobe.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      ffprobe.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ffprobe.on('close', (code) => {
        if (code === 0) {
          const duration = parseFloat(stdout.trim());
          resolve(duration);
        } else {
          console.error('FFprobe error:', stderr);
          reject(new Error('Could not get audio duration'));
        }
      });
    });
  }

  // Map voice names to language codes
  getLanguageCode(voiceName) {
    const voiceMap = {
      'en-US': 'en',
      'en-GB': 'en-gb',
      'es-ES': 'es',
      'fr-FR': 'fr',
      'de-DE': 'de',
      'it-IT': 'it',
      'pt-BR': 'pt',
      'ru-RU': 'ru',
      'ja-JP': 'ja',
      'ko-KR': 'ko',
      'zh-CN': 'zh-cn',
      'ar-SA': 'ar',
      'hi-IN': 'hi',
      'default': 'en'
    };

    // Extract language code from voice name
    for (const [key, value] of Object.entries(voiceMap)) {
      if (voiceName.includes(key) || voiceName.toLowerCase().includes(value)) {
        return value;
      }
    }

    return 'en'; // Default to English
  }

  async cleanupAudio(audioPath) {
    try {
      await fs.unlink(audioPath);
      console.log(`Cleaned up audio file: ${audioPath}`);
    } catch (error) {
      console.error('Error cleaning up audio file:', error);
    }
  }
}

module.exports = new TTSService(); 