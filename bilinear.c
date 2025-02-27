#include <stdint.h>
#include <math.h>
#include <wasm_simd128.h>

#define export __attribute__( ( visibility( "default" ) ) )

// double fmin(double a, double b) {
//     return a > b ? b : a;
// }

// float roundf(float a) {
//     float r = a - (int)a;
//     return r > 0.5 ? (int)a + 1 : (int)a;
// }

export void bilinearUpscale(uint8_t *imageData, int width, int height, int newWidth, int newHeight, uint8_t *scaledImage) {
    float xRatio = (float)(width - 1) / (newWidth - 1);
    float yRatio = (float)(height - 1) / (newHeight - 1);
    
    for (int j = 0; j < newHeight; j++) {
        float y = yRatio * j;
        int y0 = (int)y;
        int y1 = fmin(y0 + 1, height - 1);
        float yDiff = y - y0;
        float yDiffInv = 1.0f - yDiff;

        for (int i = 0; i < newWidth; i += 4) { // Process four pixels at a time using SIMD
            float x = xRatio * i;
            int x0 = (int)x;
            int x1 = fmin(x0 + 1, width - 1);
            float xDiff = x - x0;
            float xDiffInv = 1.0f - xDiff;
            
            int idx00 = y0 * width + x0;
            int idx01 = y0 * width + x1;
            int idx10 = y1 * width + x0;
            int idx11 = y1 * width + x1;

            v128_t a = wasm_i32x4_splat(imageData[idx00]);
            v128_t b = wasm_i32x4_splat(imageData[idx01]);
            v128_t c = wasm_i32x4_splat(imageData[idx10]);
            v128_t d = wasm_i32x4_splat(imageData[idx11]);

            v128_t xDiffVec = wasm_f32x4_splat(xDiff);
            v128_t xDiffInvVec = wasm_f32x4_splat(xDiffInv);
            v128_t yDiffVec = wasm_f32x4_splat(yDiff);
            v128_t yDiffInvVec = wasm_f32x4_splat(yDiffInv);
            
            v128_t result = wasm_f32x4_add(
                wasm_f32x4_add(
                    wasm_f32x4_mul(wasm_f32x4_convert_i32x4(a), wasm_f32x4_mul(xDiffInvVec, yDiffInvVec)),
                    wasm_f32x4_mul(wasm_f32x4_convert_i32x4(b), wasm_f32x4_mul(xDiffVec, yDiffInvVec))
                ),
                wasm_f32x4_add(
                    wasm_f32x4_mul(wasm_f32x4_convert_i32x4(c), wasm_f32x4_mul(xDiffInvVec, yDiffVec)),
                    wasm_f32x4_mul(wasm_f32x4_convert_i32x4(d), wasm_f32x4_mul(xDiffVec, yDiffVec))
                )
            );

            int32_t output[4];
            wasm_v128_store(output, result);
            for (int k = 0; k < 4 && (i + k) < newWidth; k++) {
                scaledImage[j * newWidth + (i + k)] = (uint8_t)roundf(output[k]);
            }
        }
    }
}

// Example usage:
/*
int main() {
    int width = 128, height = 128, newWidth = 256, newHeight = 256;
    uint8_t *originalImage = (uint8_t*)malloc(width * height * sizeof(uint8_t)); // Fill with actual data
    uint8_t *upscaledImage = (uint8_t*)malloc(newWidth * newHeight * sizeof(uint8_t));
    
    bilinearUpscale(originalImage, width, height, newWidth, newHeight, upscaledImage);
    
    free(originalImage);
    free(upscaledImage);
    return 0;
}
*/
