#include <stdint.h>
#include <wasm_simd128.h>

// to compile:
// clang -nostdlib -Wl,--no-entry -O3 -flto -Wl,--lto-O3 -Wl,--import-memory -Wl,--export-dynamic --target=wasm32 -msimd128 bilinear.c -o bilinear.wasm

#define export __attribute__( ( visibility( "default" ) ) )

export void bilinearUpscale2x(uint8_t *imageData, int width, int height, uint8_t *scaledImage) {
    int newWidth = width * 2;
    int newHeight = height * 2;

    for (int j = 0; j < height - 1; j++) {
        for (int i = 0; i < width; i += 8) { // Process 8 pixels at a time using SIMD
            int idx = j * width + i;

            // Load current and next row data for interpolation
            v128_t row1 = wasm_v128_load(&imageData[idx]);
            v128_t row2 = wasm_v128_load(&imageData[idx + width]);

            // Unpack to 16-bit integers
            v128_t p1 = wasm_u16x8_extend_low_u8x16(row1);
            v128_t p2 = wasm_u16x8_extend_high_u8x16(row1);
            v128_t q1 = wasm_u16x8_extend_low_u8x16(row2);
            v128_t q2 = wasm_u16x8_extend_high_u8x16(row2);

            // Horizontal interpolation (left and right average)
            v128_t p1_right = wasm_i16x8_shuffle(p1, p2, 1, 2, 3, 4, 5, 6, 7, 7);
            v128_t p2_right = wasm_i16x8_shuffle(p2, p2, 1, 2, 3, 4, 5, 6, 7, 7);
            v128_t avgH1 = wasm_u16x8_shr(wasm_i16x8_add(p1, p1_right), 1);
            v128_t avgH2 = wasm_u16x8_shr(wasm_i16x8_add(p2, p2_right), 1);

            // Vertical interpolation (top and bottom average)
            v128_t avgV1 = wasm_u16x8_shr(wasm_i16x8_add(p1, q1), 1);
            v128_t avgV2 = wasm_u16x8_shr(wasm_i16x8_add(p2, q2), 1);

            // Diagonal interpolation
            v128_t avgD1 = wasm_u16x8_shr(wasm_i16x8_add(avgH1, avgV1), 1);
            v128_t avgD2 = wasm_u16x8_shr(wasm_i16x8_add(avgH2, avgV2), 1);

            // Pack back to 8-bit integers
            v128_t out1 = wasm_u8x16_narrow_i16x8(p1, avgH1);
            v128_t out2 = wasm_u8x16_narrow_i16x8(avgV1, avgD1);
            v128_t out3 = wasm_u8x16_narrow_i16x8(p2, avgH2);
            v128_t out4 = wasm_u8x16_narrow_i16x8(avgV2, avgD2);

            // Store the results in the 2x2 pixel grid
            int outIdx = (j * 2) * newWidth + (i * 2);
            wasm_v128_store(&scaledImage[outIdx], out1);
            wasm_v128_store(&scaledImage[outIdx + newWidth], out2);
            wasm_v128_store(&scaledImage[outIdx + 16], out3);
            wasm_v128_store(&scaledImage[outIdx + newWidth + 16], out4);
        }
    }
}
