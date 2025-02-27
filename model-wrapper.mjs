import * as ort from './ort-dist/ort.all.min.mjs';
import ImageConverter from './image-converter.mjs';

export const MODEL_HEIGHT = 128;
export const MODEL_WIDTH = 128;
const MODEL_CHANNELS = 3;
export const MODEL_SCALE = 4;
export const MIN_TILE_OVERLAP = 8;

export default class ModelWrapper {
    constructor(width = 320, height = 240) {
        this._initModel();

        this.width = width;
        this.height = height;

        this.converter = new ImageConverter();

        this.inputFrame = this.converter.getInputBufferView(width, height, MODEL_CHANNELS);
        this.inputBuffer = this.converter.getOutputBufferView(MODEL_WIDTH, MODEL_HEIGHT);
        this.inputTensor = new ort.Tensor(this.inputBuffer, [1, MODEL_CHANNELS, MODEL_HEIGHT, MODEL_WIDTH]);

        this.outputBuffer = new Uint8ClampedArray((MODEL_WIDTH * MODEL_SCALE) * (MODEL_HEIGHT * MODEL_SCALE) * MODEL_CHANNELS);

        this.makeLayout();
    }

    _initModel() {
        this.modelPromise = ort.InferenceSession.create('SESR-M5.onnx', {
            // executionProviders: ['webgl'], // incorrect results
            // executionProviders: ['wasm'],
            executionProviders: ['webgpu'], // the most performant
            preferredOutputLocation: 'cpu-pinned',
        });
    }

    makeLayout() {
        this.tilesH = Math.ceil((this.width - MIN_TILE_OVERLAP) / (MODEL_WIDTH - MIN_TILE_OVERLAP));
        this.tilesV = Math.ceil((this.height - MIN_TILE_OVERLAP) / (MODEL_HEIGHT - MIN_TILE_OVERLAP));

        this.layout = [];
        for (let i = 0; i < this.tilesV; i++) {
            for (let j = 0; j < this.tilesH; j++) {
                const tile = {
                    x: j * (MODEL_WIDTH - MIN_TILE_OVERLAP),
                    lastInRow: j === this.tilesH - 1,
                    y: i * (MODEL_HEIGHT - MIN_TILE_OVERLAP),
                    lastInColumn: i === this.tilesV - 1,
                };
                if (j > 0 && tile.lastInRow) {
                    tile.x = this.width - MODEL_WIDTH;
                }
                if (i > 0 && tile.lastInColumn) {
                    tile.y = this.height - MODEL_HEIGHT;
                }
                this.layout.push(tile);
            }
        }
    }

    async processFrame() {
        if (this.layout.length === 1) {
            this.converter.convertI420TileToCHW(0, 0, MODEL_WIDTH, MODEL_HEIGHT, this.width, this.height);
            // this.inputBuffer.fill(0, MODEL_WIDTH * MODEL_HEIGHT);

            return [this.prepareOutput(await this.modelPromise.then(model => model.run({ image: this.inputTensor })))];
        }

        const frames = [];
        for(const tile of this.layout) {
            this.converter.convertI420TileToCHW(tile.x, tile.y, MODEL_WIDTH, MODEL_HEIGHT, this.width, this.height);
            this.inputBuffer.fill(0.5, MODEL_WIDTH * MODEL_HEIGHT); // Forced grayscale, needs at least bilinear upscaling for UV
            const result = await this.modelPromise.then(model => model.run({ image: this.inputTensor }));
            frames.push(this.prepareOutput(result));
        }

        return frames;
    }

    prepareOutput(result) {
        const { data } = result.upscaled_image;
        let ptr = 0;
        const ln = this.outputBuffer.length;
        while (ptr < ln) {
            this.outputBuffer[ptr] = data[ptr] * 255;
            ptr++;
        }

        return new VideoFrame(this.outputBuffer, {
            codedWidth: MODEL_WIDTH * 4,
            codedHeight: MODEL_HEIGHT * 4,
            format: 'I444',
            timestamp: Date.now(),
        });
    }
}
