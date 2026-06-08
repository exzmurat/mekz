// Web Audio API Sound Synthesizer for 3D Football Penalty Game
class GameAudioEngine {
    constructor() {
        this.ctx = null;
        this.crowdNode = null;
        this.crowdGain = null;
        this.initialized = false;
        this.muted = false;
    }

    init() {
        if (this.initialized) return;
        
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (!AudioContext) return;
            
            this.ctx = new AudioContext();
            this.initialized = true;
            
            // Start background crowd murmur
            this.startCrowdMurmur();
        } catch (e) {
            console.error("Audio Context could not be initialized:", e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    createNoiseBuffer() {
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
    }

    // Dynamic Crowd Murmur
    startCrowdMurmur() {
        if (!this.initialized || this.muted) return;

        try {
            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer();
            noise.loop = true;

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'bandpass';
            filter.frequency.value = 350; // Low hum
            filter.Q.value = 0.5;

            this.crowdGain = this.ctx.createGain();
            this.crowdGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Subtle background hum

            noise.connect(filter);
            filter.connect(this.crowdGain);
            this.crowdGain.connect(this.ctx.destination);
            
            noise.start(0);
            this.crowdNode = noise;
        } catch (e) {
            console.warn("Failed to start crowd murmur:", e);
        }
    }

    // Referee Whistle
    playWhistle() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        
        // Two oscillators to create beating/frequency variance
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1240, now);

        // Add frequency modulation (vibrato/pea effect)
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 30; // 30Hz flutter
        lfoGain.gain.value = 15; // frequency variance range

        lfo.connect(lfoGain);
        lfoGain.connect(osc1.frequency);
        lfoGain.connect(osc2.frequency);

        filter.type = 'bandpass';
        filter.frequency.value = 1220;
        filter.Q.value = 1.0;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.05); // Attack
        gainNode.gain.setValueAtTime(0.15, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Decay

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(filter);
        filter.connect(this.ctx.destination);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);

        lfo.stop(now + 0.4);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
    }

    // Kicking Sound
    playKick() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        
        // Low pitch thump oscillator
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'sine';
        // Pitch drop from 180Hz to 40Hz
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.12);

        gainNode.gain.setValueAtTime(0.4, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gainNode);
        gainNode.connect(this.ctx.destination);
        
        // Noise click element for kick transient impact
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.value = 250;
        noiseFilter.Q.value = 2.0;

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.ctx.destination);

        osc.start(now);
        noise.start(now);
        
        osc.stop(now + 0.16);
        noise.stop(now + 0.05);
    }

    // Metallic Goal Post Sound
    playPost() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        
        // Combine multiple ringing metal frequencies
        const freqs = [385, 520, 840, 1220];
        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6); // Decay
        gainNode.connect(this.ctx.destination);

        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;
            
            // Add slight vibrato to sound metallic
            const mod = this.ctx.createOscillator();
            const modGain = this.ctx.createGain();
            mod.frequency.value = freq * 1.5;
            modGain.gain.value = 5;

            mod.connect(modGain);
            modGain.connect(osc.frequency);

            osc.connect(gainNode);
            
            mod.start(now);
            osc.start(now);
            
            mod.stop(now + 0.6);
            osc.stop(now + 0.6);
        });
    }

    // Net Bulge Sound
    playNet() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        
        // Rustling white noise
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(350, now);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.35);
        filter.Q.value = 1.2;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.35, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.4); // Rustle fade

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 0.45);
    }

    // Crowd Celebration Roar
    playCheer() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;
        
        // Dynamically fade down ambient background murmur
        if (this.crowdGain) {
            this.crowdGain.gain.setValueAtTime(0.04, now);
            this.crowdGain.gain.exponentialRampToValueAtTime(0.005, now + 0.2);
            this.crowdGain.gain.setValueAtTime(0.005, now + 2.5);
            this.crowdGain.gain.exponentialRampToValueAtTime(0.04, now + 3.5);
        }

        // Synthesize roar
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.exponentialRampToValueAtTime(650, now + 0.5); // Rise in excitement
        filter.Q.value = 0.6;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.4, now + 0.3); // Quick swell
        gainNode.gain.setValueAtTime(0.4, now + 1.2);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // Natural crowd cheer decay

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 3.1);
    }

    // Crowd Disappointment Groan
    playGroan() {
        if (!this.initialized || this.muted) return;
        this.resume();

        const now = this.ctx.currentTime;

        const noise = this.ctx.createBufferSource();
        noise.buffer = this.createNoiseBuffer();

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, now);
        filter.frequency.linearRampToValueAtTime(220, now + 0.6); // Pitch drop in disappointment
        filter.Q.value = 0.8;

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.25); // Swell
        gainNode.gain.setValueAtTime(0.3, now + 0.8);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2.2); // Decay

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.ctx.destination);

        noise.start(now);
        noise.stop(now + 2.3);
    }

    toggleMute() {
        this.muted = !this.muted;
        if (this.muted) {
            if (this.crowdGain) this.crowdGain.gain.setValueAtTime(0, this.ctx.currentTime);
        } else {
            if (this.ctx) {
                this.resume();
                if (this.crowdGain) this.crowdGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
            } else {
                this.init();
            }
        }
        return this.muted;
    }
}

// Global Single Instance
const audio = new GameAudioEngine();
window.gameAudio = audio;
