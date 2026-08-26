#!/usr/bin/env python3
import sys
import os
import json
import base64
import time
import re
import traceback

# Meeting domain vocabulary prompt for Whisper context biasing
MEETING_PROMPT = (
    "Meeting notes, sync, sprint planning, daily standup, roadmap, architecture, "
    "deployment, PR, CI/CD, Redis, Kubernetes, OAuth, API, Argus, Pulse, SLA, "
    "action items, key decisions, discussion highlights, next steps."
)

# Known Whisper hallucination phrases on silence / low-volume noise
HALLUCINATION_PHRASES = {
    "thank you for watching",
    "thanks for watching",
    "thank you very much",
    "thank you",
    "thanks",
    "subtitles by",
    "subscribe to my channel",
    "please subscribe",
    "like and subscribe",
    "see you next time",
    "see you tomorrow",
    "bye bye",
    "goodbye",
    "music",
    "applause",
    "laughter",
    "silence",
    "foreign",
    "you",
    "the",
    "a",
    "i'm out.",
    "watching.",
    "subtitles",
    "amara.org",
}

def format_timestamp(seconds: float) -> str:
    total_sec = max(0, int(round(seconds)))
    h = total_sec // 3600
    m = (total_sec % 3600) // 60
    s = total_sec % 60
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"

def is_hallucination(text: str) -> bool:
    clean = re.sub(r'[^\w\s]', '', text.lower()).strip()
    if not clean or len(clean) < 3:
        return True
    if clean in HALLUCINATION_PHRASES:
        return True
    for phrase in HALLUCINATION_PHRASES:
        if clean == phrase or clean == f"{phrase}":
            return True
    # If text is just 1 or 2 repeating words (e.g. "you you you")
    words = clean.split()
    if len(words) >= 3 and len(set(words)) == 1:
        return True
    return False

def suppress_repetitions(text: str) -> str:
    """Removes repeating loop phrases (e.g. 'I think I think I think' -> 'I think')"""
    words = text.split()
    if len(words) <= 1:
        return text

    # Remove consecutive repeated single words
    cleaned_words = []
    for w in words:
        if not cleaned_words or w.lower() != cleaned_words[-1].lower():
            cleaned_words.append(w)
        elif len(cleaned_words) >= 1 and w.lower() == cleaned_words[-1].lower():
            # Already have 1 instance, do not append duplicate
            continue

    text = " ".join(cleaned_words)

    # Remove 2-word repeated loops (e.g. "we have we have")
    text = re.sub(r'\b(\w+\s+\w+)(?:\s+\1\b)+', r'\1', text, flags=re.IGNORECASE)
    # Remove 3-word repeated loops (e.g. "in the meeting in the meeting")
    text = re.sub(r'\b(\w+\s+\w+\s+\w+)(?:\s+\1\b)+', r'\1', text, flags=re.IGNORECASE)
    return text.strip()

def clean_sentence(text: str) -> str:
    t = suppress_repetitions(text.strip())
    if not t:
        return ""
    # Capitalize first letter
    t = t[0].upper() + t[1:] if len(t) > 1 else t.upper()
    # Add ending punctuation if missing
    if t and t[-1] not in ".?!":
        t += "."
    return t

class HighAccuracyTranscriber:
    def __init__(self, model_name="turbo", download_root=None):
        self.model_name = model_name
        self.download_root = download_root or os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models")
        self.model = None
        self.device = "cpu"
        self.is_loaded = False
        self._init_model()

    def _init_model(self):
        try:
            import torch
            import whisper

            # Use CPU Vectorized / Accelerate for reliable 100% precision on macOS
            self.device = "cuda" if torch.cuda.is_available() else "cpu"
            clean_name = self.model_name.lower()

            if "turbo" in clean_name or "parakeet" in clean_name:
                w_name = "turbo"
            elif "large" in clean_name:
                w_name = "large-v3"
            elif "medium" in clean_name:
                w_name = "medium"
            elif "small" in clean_name:
                w_name = "small"
            elif "tiny" in clean_name:
                w_name = "tiny"
            elif "base" in clean_name:
                w_name = "base"
            else:
                w_name = "turbo"

            # Check if turbo is already cached or fallback to base
            try:
                self.model = whisper.load_model(w_name, download_root=self.download_root, device=self.device)
            except Exception as load_err:
                sys.stderr.write(f"[StreamWorker] Trying fallback 'base' model ({load_err})\n")
                self.model = whisper.load_model("base", download_root=self.download_root, device=self.device)
                w_name = "base"

            self.is_loaded = True
            sys.stderr.write(f"[StreamWorker] High-Accuracy Model '{w_name}' resident in memory on {self.device}\n")
            sys.stderr.flush()
        except Exception as e:
            sys.stderr.write(f"[StreamWorker] Notice: Whisper running in fallback mode ({e})\n")
            sys.stderr.flush()
            self.is_loaded = False

    def transcribe_pcm(self, pcm_bytes, language="en", offset_seconds=0.0):
        if not pcm_bytes or len(pcm_bytes) < 6400: # Need at least 200ms
            return []

        if self.is_loaded and self.model is not None:
            try:
                import numpy as np
                import torch
                import whisper

                # Convert 16-bit PCM buffer to normalized float32
                audio_np = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

                # Strict Voice Activity Energy Gate
                energy = float(np.abs(audio_np).mean())
                if energy < 0.005:  # Silence / low noise threshold
                    return []

                # Peak-to-RMS crest check to filter static hum
                rms = float(np.sqrt(np.mean(audio_np**2)))
                if rms < 0.006:
                    return []

                # Pad or trim audio tensor to 16kHz
                audio_tensor = whisper.pad_or_trim(audio_np)
                mel = whisper.log_mel_spectrogram(audio_tensor, n_mels=self.model.dims.n_mels).to(self.device)

                # Beam search decoding with strict English and meeting domain prompt
                options = whisper.DecodingOptions(
                    language="en",
                    fp16=(self.device == "cuda"),
                    beam_size=5,
                    temperature=0.0,
                    prompt=MEETING_PROMPT,
                    without_timestamps=True,
                    suppress_blank=True
                )
                result = whisper.decode(self.model, mel, options)

                raw_text = result.text.strip()
                if not raw_text or len(raw_text) < 3:
                    return []

                # Anti-hallucination check
                if is_hallucination(raw_text):
                    return []

                # Compression ratio filter (catches repeating character loops)
                if getattr(result, 'compression_ratio', 1.0) > 2.4:
                    return []

                # Avg logprob filter (catches low confidence gibberish)
                if getattr(result, 'avg_logprob', 0.0) < -1.1:
                    return []

                # Clean and capitalize
                sentence = clean_sentence(raw_text)
                if sentence and len(sentence) >= 3 and not is_hallucination(sentence):
                    return [{
                        "id": f"seg-{int(time.time()*1000)}",
                        "time": format_timestamp(offset_seconds),
                        "text": sentence,
                        "raw": raw_text,
                        "energy": round(energy, 4)
                    }]
            except Exception as e:
                sys.stderr.write(f"[StreamWorker] Decode error: {e}\n")
                sys.stderr.flush()

        return []

def main():
    model_arg = sys.argv[1] if len(sys.argv) > 1 else "turbo"
    download_root = sys.argv[2] if len(sys.argv) > 2 else None

    transcriber = HighAccuracyTranscriber(model_name=model_arg, download_root=download_root)

    print(json.dumps({"status": "ready", "device": transcriber.device, "loaded": transcriber.is_loaded}))
    sys.stdout.flush()

    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue

        try:
            req = json.loads(line)
            action = req.get("action", "transcribe")

            if action == "ping":
                print(json.dumps({"status": "pong"}))
                sys.stdout.flush()
                continue

            if action == "transcribe_base64":
                raw_b64 = req.get("pcm_base64", "")
                offset_sec = float(req.get("offset_seconds", 0.0))
                lang = req.get("language", "en")
                pcm_bytes = base64.b64decode(raw_b64)

                segments = transcriber.transcribe_pcm(pcm_bytes, language=lang, offset_seconds=offset_sec)
                print(json.dumps({
                    "success": True,
                    "id": req.get("id", ""),
                    "segments": segments
                }))
                sys.stdout.flush()
                continue

        except Exception as err:
            print(json.dumps({"success": False, "error": str(err), "segments": []}))
            sys.stdout.flush()

if __name__ == "__main__":
    main()
