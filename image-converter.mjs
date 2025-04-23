const MODULE_SOURCE = "AGFzbQEAAAABGQNgBH9/f38AYAN/f38AYAh/f39/f39/fwACDwEDZW52Bm1lbW9yeQIAAAMGBQEAAAIAB00FCE52MTJUb0hXAAAJTnYxMlRvQ0hXAAEJSTQyMFRvQ0hXAAINSTQyMFRpbGVUb0NIVwADFmJpbGluZWFyVXBzY2FsZUNoYW5uZWwABAqQEAVOACAAIAJqIQIDQCAAIAJIBEAgASAA/QkCAP2JAf2pAf37Af0MAAB/QwAAf0MAAH9DAAB/Q/3nAf0LBAAgAEEEaiEAIAFBEGohAQwBCwsLtgICA38BeyACIANsIgMgAGohBQNAIAAgBUgEQCABIAD9CQIA/YkB/akB/fsB/QwAAH9DAAB/QwAAf0MAAH9D/ecB/QsEACAAQQRqIQAgAUEQaiEBDAELCyABIANBAnRqIQQgBSADQQJtaiEGIAJBAnQhBSACQQJtIgMhAgNAIAAgBkgEQCAA/QkCACEHIABBBGohACABIAf9iQH9qQH9+wH9DAAAf0MAAH9DAAB/QwAAf0P95wEiB/0MAAECAwABAgMICQoLCAkKC/0O/QsEACABQRBqIQEgBCAH/QwEBQYHBAUGBwwNDg8MDQ4P/Q79CwQAIARBEGohBCACQQJrIgJBAEwEQCABIAEgBWsgBfwKAAAgBCAEIAVrIAX8CgAAIAQgBWohBCADIQIgASAFaiEBCwwBCwsLjwICAXsCfyACIANsIgMgAGohBQNAIAAgBUgEQCABIAD9CQIA/YkB/akB/fsB/QwAAH9DAAB/QwAAf0MAAH9D/ecB/QsEACAAQQRqIQAgAUEQaiEBDAELCyAAIANBAm1qIQYgAkECdCEFIAJBAm0iAyECA0AgACAGSARAIAD9CQIA/YkB/akB/fsB/QwAAH9DAAB/QwAAf0MAAH9D/ecBIQQgAEEEaiEAIAEgBP0MAAECAwABAgMEBQYHBAUGB/0O/QsEACABIAT9DAgJCgsICQoLDA0ODwwNDg/9Dv0LBBAgAUEgaiEBIAJBBGsiAkEATARAIAEgASAFayAF/AoAACADIQIgASAFaiEBCwwBCwsLngMCA38BeyAGIAdsIgcgAGogAkEBdWogA0EBdSAGQQF1bGoiCCAHQQRtaiEJIAVBAXUhByAAIAJqIAMgBmxqIQAgASEDIARBAnQhCgNAIAVBAEoEQCAEIQEDQCABQQBKBEAgAyAA/QkCAP2JAf2pAf37Af0MAAB/QwAAf0MAAH9DAAB/Q/3nAf0LBAAgAEEEaiEAIANBEGohAyABQQRrIQEMAQsLIAAgBiAEa2ohACAFQQFrIQUMAQsLIAghACAHIQIgBEECbSEEQQEhBQNAIAJBAEoEQCAEIQEDQCABQQBKBEAgAyAA/QkCAP2JAf2pAf37Af0MAAB/QwAAf0MAAH9DAAB/Q/3nASIL/QwAAQIDAAECAwQFBgcEBQYH/Q79CwQAIAMgC/0MCAkKCwgJCgsMDQ4PDA0OD/0O/QsEECAAQQRqIQAgAUEEayEBIANBIGohAwwBCwsgAyADIAprIAr8CgAAIAMgCmohAyAAIAZBAm0gBGtqIQAgAkEBayICQQBMIAVBAEpxBEAgBUEBayEFIAchAiAJIQALDAELCwvVBwINfwZ7IAJBAXQhDANAIAMgDUoEQCAAIAIgDWxqIg8gAmogDyANQQFqIANIGyEOIAEgDUEBdCIEIAxsaiELIAEgBEEBaiAMbGohCkEAIRADQCAQIAJBEGtMBEAgDyAQaiIE/QAEACEVIBBBEGogAkgEeyAE/QAEASEWIA4gEGr9AAQBBSACIBBrQQFrIgRBAEoEeyAPIBBq/QAEASEWIA4gEGr9AAQBIRIgBEEQSAR7IBb9DP8AAAAAAAAAAAAAAAAAAAD9DP//AAAAAAAAAAAAAAAAAAD9DP///wAAAAAAAAAAAAAAAAD9DP////8AAAAAAAAAAAAAAAD9DP//////AAAAAAAAAAAAAAD9DP///////wAAAAAAAAAAAAD9DP////////8AAAAAAAAAAAD9DP//////////AAAAAAAAAAD9DP///////////wAAAAAAAAD9DP////////////8AAAAAAAD9DP//////////////AAAAAAD9DP///////////////wAAAAD9DP////////////////8AAAD9DP//////////////////AAD9DP///////////////////wAgBEEORhsgBEENRhsgBEEMRhsgBEELRhsgBEEKRhsgBEEJRhsgBEEIRhsgBEEHRhsgBEEGRhsgBEEFRhsgBEEERhsgBEEDRhsgBEECRhsgBEEBRhsiEf1OIAIgD2pBAWstAAD9DyAR/U39Tv1QIRYgEiAR/U4gAiAOakEBay0AAP0PIBH9Tf1O/VAFIBILBSACIA9qQQFrLQAA/Q8hFiACIA5qQQFrLQAA/Q8LCyERIBUgDiAQav0ABAAiFP17IRMgFSAW/XsiEiAUIBH9e/17IREgEEEBdCIFIAtqIgQgFSAS/Q0AEAERAhIDEwQUBRUGFgcX/QsEACAEIBUgEv0NCBgJGQoaCxsMHA0dDh4PH/0LBBAgBSAKaiIEIBMgEf0NABABEQISAxMEFAUVBhYHF/0LBAAgBCATIBH9DQgYCRkKGgsbDBwNHQ4eDx/9CwQQIBBBEGohEAwBCwsDQCACIBBKBEAgDyAQaiIELQAAIQcgEEEBaiACSAR/IAQtAAEFIAcLIQYgDiAQaiIELQAAIQUgEEEBaiACSAR/IAQtAAEFIAULIQQgEEEBdCIJIAtqIgggBzoAACAIIAYgB2oiCEEBakH/AXFBAXY6AAEgCSAKaiIGIAUgB2pBAWpB/wFxQQF2OgAAIAYgBSAIaiAEakECakH/AXFBAnY6AAEgEEEBaiEQDAELCyANQQFqIQ0MAQsLCw==";
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
    return alignSizeTo16(this.currentMaxSize * 3);
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
  convertI420ToCHWBilinear(width, height) {
    const mem = new Uint8Array(this.memory.buffer);
    const fullPlaneSize = width * height;
    this.wasmHelpers.bilinearUpscaleChannel(fullPlaneSize, this.outputPtr, width / 2, height / 2);
    this.wasmHelpers.bilinearUpscaleChannel(fullPlaneSize * 1.25, fullPlaneSize * 2, width / 2, height / 2);
    mem.copyWithin(fullPlaneSize, this.outputPtr, this.outputPtr + fullPlaneSize);
    this.wasmHelpers.Nv12ToHW(0, this.outputPtr, fullPlaneSize);
    this.wasmHelpers.Nv12ToHW(fullPlaneSize, this.outputPtr + fullPlaneSize * 4, fullPlaneSize);
    this.wasmHelpers.Nv12ToHW(fullPlaneSize * 2, this.outputPtr + fullPlaneSize * 8, fullPlaneSize);
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
