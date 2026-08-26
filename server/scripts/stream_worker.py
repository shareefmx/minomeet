#!/usr/bin/env python3
import sys
import os
import json
import base64
import time
import io
import wave
import traceback

def format_timestamp(seconds: float) -> str:
    total_sec = max(0, int(round(seconds)))
    h = total_sec // 3600
    m = (total_sec % 3600) // 60
    s = total_sec % 60
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"

def clean_sentence(text: str) -> str:
    t = text.strip()
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

            self.device = "cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu")
            clean_name = self.model_name.lower()
            if "parakeet" in clean_name or "turbo" in clean_name:
                w_name = "turbo"
            elif "large" in clean_name:
                w_name = "large-v3"
            elif "medium" in clean_name:
                w_name = "medium"
            elif "small" in clean_name:
                w_name = "small"
            elif "tiny" in clean_name:
                w_name = "tiny"
            else:
                w_name = "turbo"

            self.model = whisper.load_model(w_name, download_root=self.download_root, device=self.device)
            self.is_loaded = True
            sys.stderr.write(f"[StreamWorker] High-Accuracy Model '{w_name}' resident in memory on {self.device}\n")
            sys.stderr.flush()
        except Exception as e:
            sys.stderr.write(f"[StreamWorker] Notice: Whisper running in fallback mode ({e})\n")
            sys.stderr.flush()
            self.is_loaded = False

    def transcribe_pcm(self, pcm_bytes, language=None, offset_seconds=0.0):
        if not pcm_bytes or len(pcm_bytes) < 6400: # Need at least 200ms of audio
            return []

        if self.is_loaded and self.model is not None:
            try:
                import numpy as np
                import torch
                import whisper

                # Convert 16-bit PCM buffer directly to normalized float32 numpy array
                audio_np = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

                # Silence gate: Check audio energy
                energy = np.abs(audio_np).mean()
                if energy < 0.003:
                    return []

                # Pad or trim to 16kHz Whisper tensor
                audio_tensor = whisper.pad_or_trim(audio_np)
                mel = whisper.log_mel_spectrogram(audio_tensor, n_mels=self.model.dims.n_mels).to(self.device)

                # High accuracy beam search decoding
                options = whisper.DecodingOptions(
                    language=language if language and language != "auto" else None,
                    fp16=(self.device == "cuda"),
                    beam_size=5,
                    temperature=0.0,
                    without_timestamps=True
                )
                result = whisper.decode(self.model, mel, options)

                raw_text = result.text.strip()
                if raw_text and len(raw_text) > 2:
                    # Clean into complete sentence
                    sentence = clean_sentence(raw_text)
                    return [{
                        "id": f"seg-{int(time.time()*1000)}",
                        "time": format_timestamp(offset_seconds),
                        "text": sentence,
                        "raw": raw_text
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
                lang = req.get("language", None)
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
