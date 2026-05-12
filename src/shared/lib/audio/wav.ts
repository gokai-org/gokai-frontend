"use client";

type AudioContextWindow = Window & {
  webkitAudioContext?: typeof AudioContext;
};

function getAudioContextClass() {
  return window.AudioContext || (window as AudioContextWindow).webkitAudioContext;
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function downmixToMono(audioBuffer: AudioBuffer) {
  const mono = new Float32Array(audioBuffer.length);
  const channelCount = Math.max(1, audioBuffer.numberOfChannels);

  for (let channelIndex = 0; channelIndex < channelCount; channelIndex += 1) {
    const channelData = audioBuffer.getChannelData(channelIndex);

    for (let sampleIndex = 0; sampleIndex < audioBuffer.length; sampleIndex += 1) {
      mono[sampleIndex] += channelData[sampleIndex] / channelCount;
    }
  }

  return mono;
}

function resampleAudio(source: Float32Array, sourceSampleRate: number, targetSampleRate: number) {
  if (sourceSampleRate === targetSampleRate) {
    return source;
  }

  const ratio = sourceSampleRate / targetSampleRate;
  const targetLength = Math.max(1, Math.round(source.length / ratio));
  const result = new Float32Array(targetLength);

  for (let index = 0; index < targetLength; index += 1) {
    const sourcePosition = index * ratio;
    const leftIndex = Math.floor(sourcePosition);
    const rightIndex = Math.min(leftIndex + 1, source.length - 1);
    const interpolation = sourcePosition - leftIndex;
    const leftSample = source[leftIndex] ?? 0;
    const rightSample = source[rightIndex] ?? leftSample;

    result[index] = leftSample + (rightSample - leftSample) * interpolation;
  }

  return result;
}

function encodeMonoPcm16Wav(samples: Float32Array, sampleRate: number) {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let index = 0; index < samples.length; index += 1) {
    const sample = Math.max(-1, Math.min(1, samples[index] ?? 0));
    const pcmValue = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    view.setInt16(offset, Math.round(pcmValue), true);
    offset += bytesPerSample;
  }

  return buffer;
}

export async function convertAudioBlobToMonoWavFile(
  blob: Blob,
  fileName = "pronunciation.wav",
  targetSampleRate = 22050,
) {
  if (typeof window === "undefined") {
    throw new Error("La conversión de audio solo está disponible en el navegador.");
  }

  const AudioContextClass = getAudioContextClass();
  if (!AudioContextClass) {
    throw new Error("Tu navegador no soporta la conversión de audio requerida.");
  }

  const audioContext = new AudioContextClass();

  try {
    const buffer = await blob.arrayBuffer();
    const decodedAudio = await audioContext.decodeAudioData(buffer.slice(0));
    const monoSamples = downmixToMono(decodedAudio);
    const resampledSamples = resampleAudio(
      monoSamples,
      decodedAudio.sampleRate,
      targetSampleRate,
    );
    const wavBuffer = encodeMonoPcm16Wav(resampledSamples, targetSampleRate);

    return new File([wavBuffer], fileName, { type: "audio/wave" });
  } catch (error) {
    console.error("No se pudo convertir el audio a WAV mono 22050 Hz:", error);
    throw new Error("No se pudo preparar el audio en formato WAV para pronunciación.");
  } finally {
    if (audioContext.state !== "closed") {
      await audioContext.close().catch(() => undefined);
    }
  }
}