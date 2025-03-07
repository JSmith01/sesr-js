const MODULE_SOURCE = "AGFzbQEAAAABGQNgBH9/f38AYAN/f38AYAh/f39/f39/fwACDwEDZW52Bm1lbW9yeQIAAAMFBAEAAAIHNAQITnYxMlRvSFcAAAlOdjEyVG9DSFcAAQlJNDIwVG9DSFcAAg1JNDIwVGlsZVRvQ0hXAAMKuQgETgAgACACaiECA0AgACACSARAIAEgAP0JAgD9iQH9qQH9+wH9DAAAf0MAAH9DAAB/QwAAf0P95wH9CwQAIABBBGohACABQRBqIQEMAQsLC7YCAgN/AXsgAiADbCIDIABqIQUDQCAAIAVIBEAgASAA/QkCAP2JAf2pAf37Af0MAAB/QwAAf0MAAH9DAAB/Q/3nAf0LBAAgAEEEaiEAIAFBEGohAQwBCwsgASADQQJ0aiEEIAUgA0ECbWohBiACQQJ0IQUgAkECbSIDIQIDQCAAIAZIBEAgAP0JAgAhByAAQQRqIQAgASAH/YkB/akB/fsB/QwAAH9DAAB/QwAAf0MAAH9D/ecBIgf9DAABAgMAAQIDCAkKCwgJCgv9Dv0LBAAgAUEQaiEBIAQgB/0MBAUGBwQFBgcMDQ4PDA0OD/0O/QsEACAEQRBqIQQgAkECayICQQBMBEAgASABIAVrIAX8CgAAIAQgBCAFayAF/AoAACAEIAVqIQQgAyECIAEgBWohAQsMAQsLC48CAgF7An8gAiADbCIDIABqIQUDQCAAIAVIBEAgASAA/QkCAP2JAf2pAf37Af0MAAB/QwAAf0MAAH9DAAB/Q/3nAf0LBAAgAEEEaiEAIAFBEGohAQwBCwsgACADQQJtaiEGIAJBAnQhBSACQQJtIgMhAgNAIAAgBkgEQCAA/QkCAP2JAf2pAf37Af0MAAB/QwAAf0MAAH9DAAB/Q/3nASEEIABBBGohACABIAT9DAABAgMAAQIDBAUGBwQFBgf9Dv0LBAAgASAE/QwICQoLCAkKCwwNDg8MDQ4P/Q79CwQQIAFBIGohASACQQRrIgJBAEwEQCABIAEgBWsgBfwKAAAgAyECIAEgBWohAQsMAQsLC54DAgN/AXsgBiAHbCIHIABqIAJBAXVqIANBAXUgBkEBdWxqIgggB0EEbWohCSAFQQF1IQcgACACaiADIAZsaiEAIAEhAyAEQQJ0IQoDQCAFQQBKBEAgBCEBA0AgAUEASgRAIAMgAP0JAgD9iQH9qQH9+wH9DAAAf0MAAH9DAAB/QwAAf0P95wH9CwQAIABBBGohACADQRBqIQMgAUEEayEBDAELCyAAIAYgBGtqIQAgBUEBayEFDAELCyAIIQAgByECIARBAm0hBEEBIQUDQCACQQBKBEAgBCEBA0AgAUEASgRAIAMgAP0JAgD9iQH9qQH9+wH9DAAAf0MAAH9DAAB/QwAAf0P95wEiC/0MAAECAwABAgMEBQYHBAUGB/0O/QsEACADIAv9DAgJCgsICQoLDA0ODwwNDg/9Dv0LBBAgAEEEaiEAIAFBBGshASADQSBqIQMMAQsLIAMgAyAKayAK/AoAACADIApqIQMgACAGQQJtIARraiEAIAJBAWsiAkEATCAFQQBKcQRAIAVBAWshBSAHIQIgCSEACwwBCwsL";
let module;
function loadWasm(imports) {
  if (!module) {
    const s = atob(MODULE_SOURCE);
    const bytes = new Uint8Array(s.length);
    for (let i = 0; i < s.length; i++) {
      bytes[i] = s.charCodeAt(i);
    }
    module = new WebAssembly.Module(bytes);
  }
  return new WebAssembly.Instance(module, imports);
}
const alignSizeTo16 = (n) => Math.ceil(n / 16) * 16;
class ImageConverter {
  static maxWidth = 1280;
  static maxHeight = 720;
  currentMaxSize;
  memory;
  outputPtr;
  instance;
  wasmHelpers;
  constructor(width = ImageConverter.maxWidth, height = ImageConverter.maxHeight) {
    this.adjustMemory(width, height);
    this.instance = loadWasm({ env: { memory: this.memory } });
    this.wasmHelpers = this.instance.exports;
  }
  _getAlignedYUVBufferSize() {
    return alignSizeTo16(this.currentMaxSize * 1.5);
  }
  _getMemorySize() {
    const alignedYUVBufferSize = this._getAlignedYUVBufferSize();
    const alignedOutputBufferSize = alignSizeTo16(this.currentMaxSize * 12);
    return Math.ceil((alignedYUVBufferSize + alignedOutputBufferSize) / 65536);
  }
  adjustMemory(width, height) {
    if (this.currentMaxSize > 0 && width * height <= this.currentMaxSize) return;
    this.currentMaxSize = width * height;
    const pagesNeeded = this._getMemorySize();
    this.outputPtr = this._getAlignedYUVBufferSize();
    if (this.memory) {
      const pagesReserved = this.memory.buffer.byteLength / 65536;
      this.memory.grow(pagesNeeded - pagesReserved);
    } else {
      this.memory = new WebAssembly.Memory({ initial: pagesNeeded });
    }
  }
  getInputBufferView(width, height, channels = 3) {
    return new Uint8Array(this.memory.buffer, 0, width * height * (channels === 3 ? 1.5 : 1));
  }
  getOutputBufferView(width, height, channels = 3) {
    return new Float32Array(this.memory.buffer, this.outputPtr, width * height * channels);
  }
  // Y component only
  convertI420ToHW(width, height) {
    return this.convertNv12ToHW(width, height);
  }
  // Y component only
  convertNv12ToHW(width, height) {
    if (!this.wasmHelpers) throw new Error(`initialization hasn't finished yet`);
    console.assert(width * height % 4 === 0, `Incorrect (width x height) = ${width}x${height} not divisible by 4`);
    this.wasmHelpers.Nv12ToHW(0, this.outputPtr, width * height);
  }
  convertNv12ToCHW(width, height) {
    if (!this.wasmHelpers) throw new Error(`initialization hasn't finished yet`);
    console.assert(width % 4 === 0, `Incorrect width = ${width} not divisible by 4`);
    this.wasmHelpers.Nv12ToCHW(0, this.outputPtr, width, height);
  }
  convertI420ToCHW(width, height) {
    if (!this.wasmHelpers) throw new Error(`initialization hasn't finished yet`);
    console.assert(width % 8 === 0, `Incorrect width = ${width} not divisible by 8`);
    this.wasmHelpers.I420ToCHW(0, this.outputPtr, width, height);
  }
  convertI420TileToCHW(x, y, width, height, frameWidth, frameHeight) {
    if (!this.wasmHelpers) throw new Error(`initialization hasn't finished yet`);
    console.assert(x % 4 === 0, `Incorrect x = ${x} not divisible by 8`);
    console.assert(width % 8 === 0, `Incorrect width = ${width} not divisible by 8`);
    this.wasmHelpers.I420TileToCHW(0, this.outputPtr, x, y, width, height, frameWidth, frameHeight);
  }
  convertNv12ToHWC(width, height) {
    throw new Error("Not implemented yet");
  }
  convertI420ToHWC(width, height) {
    throw new Error("Not implemented yet");
  }
}
export default ImageConverter;
