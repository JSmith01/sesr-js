/**
 * Produces stream of VideoFrame-s from the given media stream
 * @param {MediaStream} stream
 * @param {{ width: number, height: number, buffer: Uint8Array }} current
 * @returns {AsyncGenerator<{displayHeight: number, duration: number, colorSpace: VideoColorSpaceInit, visibleRect: any, codedWidth: number, codedRect: any, displayWidth: number, format: VideoPixelFormat, codedHeight: number, buffer: Uint8Array, timestamp: number, unexpectedDims: boolean }, void, *>}
 */
export async function* getRawFrames(stream, current) {
    const [track] = stream.getVideoTracks();
    const trackProcessor = new MediaStreamTrackProcessor({ track });
    const reader = trackProcessor.readable.getReader();
    let frameData, firstFrame = true;
    while (true) {
        const readValue = await reader.read();
        if (readValue.done) {
            console.log('DONE')
            break;
        }

        const frame = readValue.value;
        if (!frame) continue;

        const unexpectedDims = current.height !== frame.codedHeight || current.width !== frame.codedWidth;
        if (firstFrame || unexpectedDims) {
            console.log(frame.format, frame.codedWidth, frame.codedHeight, frame.codedRect.toJSON(), frame.visibleRect.toJSON(), frame.colorSpace.toJSON());
            frameData = {
                format: frame.format,
                codedWidth: frame.codedWidth,
                codedHeight: frame.codedHeight,
                codedRect: frame.codedRect.toJSON(),
                visibleRect: frame.visibleRect.toJSON(),
                displayWidth: frame.displayWidth,
                displayHeight: frame.displayHeight,
                duration: frame.duration,
                timestamp: frame.timestamp,
                colorSpace: frame.colorSpace.toJSON(),
                unexpectedDims,
                buffer: current.buffer,
            };
        }

        if (!unexpectedDims) {
            frameData.planes = await frame.copyTo(current.buffer);
        }
        frame.close();

        yield frameData;
    }
}
