# Video AI upscaling demo for web

It makes use of [Qualcomm AI Hub](https://aihub.qualcomm.com/) models, converted to ONNX. The input format is I420; to convert to it
WebRTC pass-through is used. Image converter is written in AssemblyScript with SIMD intrinsics and
compiled to inlined WASM, to be published separately.

It wasn't possible to make use of `transformers.js` for the purpose, so it is based directly on [onnxruntime](https://github.com/microsoft/onnxruntime).

Inference engine is configured to use WebGPU, since WebGL doesn't work at all, and CPU-based suffers from poor performance.


## License

Qualcomm's models have [their own licence](https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/Qualcomm+AI+Hub+Proprietary+License.pdf).

This repo (except models) is MIT.
