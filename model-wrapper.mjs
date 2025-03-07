import * as ort from './ort-dist/ort.all.min.mjs';
import ImageConverter from './image-converter.mjs';

export const MIN_TILE_OVERLAP = 8;

export default class ModelWrapper {
    constructor(width, height, modelInit) {
        this._model = modelInit;
        this._initModel(modelInit);

        this.width = width;
        this.height = height;

        if (modelInit.height < height || modelInit.width < width) {
            this._tiled = true;
            this.layout = this.makeLayout(modelInit);
        } else {
            this._tiled = false;
        }

        this.converter = new ImageConverter(width, height);

        this.inputFrame = this.converter.getInputBufferView(width, height, modelInit.channels);
        console.log('Model init', modelInit);
        this.inputBuffer = this.converter.getOutputBufferView(modelInit.width, modelInit.height);
        this.inputTensor = new ort.Tensor(this.inputBuffer, [1, modelInit.channels, modelInit.height, modelInit.width]);

        this.outputBuffer = new Uint8ClampedArray(
            (modelInit.width * modelInit.scale) * (modelInit.height * modelInit.scale) * modelInit.channels
        );
    }

    _initModel(model) {
        this.modelPromise = ort.InferenceSession.create(model.file, {
            // executionProviders: ['webgl'], // incorrect results
            // executionProviders: ['wasm'],
            executionProviders: ['webgpu'], // the most performant
            preferredOutputLocation: 'cpu-pinned',
            ...model.additionalParameters,
        }).then(model => {
            console.log('MODEL', model);
            this._inputName = model.inputNames[0];
            this._outputName = model.outputNames[0];
            console.log(`Param names: input=${this._inputName}, output=${this._outputName}`);

            return model;
        });
    }

    destroy() {
        this.modelPromise.then(model => model.release());
    }

    makeLayout(model) {
        this.tilesH = Math.ceil((this.width - MIN_TILE_OVERLAP) / (model.width - MIN_TILE_OVERLAP));
        this.tilesV = Math.ceil((this.height - MIN_TILE_OVERLAP) / (model.height - MIN_TILE_OVERLAP));

        const layout = [];
        for (let i = 0; i < this.tilesV; i++) {
            for (let j = 0; j < this.tilesH; j++) {
                const tile = {
                    x: j * (model.width - MIN_TILE_OVERLAP),
                    lastInRow: j === this.tilesH - 1,
                    y: i * (model.height - MIN_TILE_OVERLAP),
                    lastInColumn: i === this.tilesV - 1,
                };
                if (j > 0 && tile.lastInRow) {
                    tile.x = this.width - model.width;
                }
                if (i > 0 && tile.lastInColumn) {
                    tile.y = this.height - model.height;
                }
                layout.push(tile);
            }
        }

        return layout;
    }

    async processFrame() {
        const model = this._model;
        if (!this._tiled) {
            this.converter.convertI420ToCHW(this.width, this.height);

            return [this.prepareOutput(await this.modelPromise.then(model => model.run({ [this._inputName]: this.inputTensor })))];
        }

        const frames = [];
        for(const tile of this.layout) {
            this.converter.convertI420TileToCHW(tile.x, tile.y, model.width, model.height, this.width, this.height);
            const result = await this.modelPromise.then(model => model.run({ [this._inputName]: this.inputTensor }));
            frames.push(this.prepareOutput(result));
        }

        return frames;
    }

    prepareOutput(result) {
        const model = this._model;
        const { data } = result[this._outputName];
        let ptr = 0;
        const ln = this.outputBuffer.length;
        while (ptr < ln) {
            this.outputBuffer[ptr] = data[ptr] * 255;
            ptr++;
        }

        return new VideoFrame(this.outputBuffer, {
            codedWidth: model.width * model.scale,
            codedHeight: model.height * model.scale,
            format: 'I444',
            timestamp: Date.now(),
        });
    }
}
