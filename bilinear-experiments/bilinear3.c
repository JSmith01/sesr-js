#include <stdint.h>
#include <wasm_simd128.h>

// to compile:
// clang -nostdlib -Wl,--no-entry -O3 -flto -Wl,--lto-O3 -Wl,--import-memory -Wl,--export-dynamic --target=wasm32 -msimd128 bilinear3.c -o bilinear3.wasm

#define export __attribute__( ( visibility( "default" ) ) )

export void bilinear_upscale(uint8_t *src, int src_width, int src_height, uint8_t *dst) {
    int dst_width = src_width * 2;
    int dst_height = src_height * 2;

    for (int y = 0; y < src_height; y++) {
        uint8_t * src_row = &src[y * src_width];
        uint8_t * src_next_row = (y < src_height - 1) ? &src[(y + 1) * src_width] : src_row;
        uint8_t row0_px, row1_px;
        for (int x = 0; x < src_width; x++) {
            uint8_t a = (x == 0) ? src_row[x] : row0_px;
            uint8_t b;
            if (x < src_width - 1) {
                b = src_row[x + 1];
                row0_px = b;
            } else {
                b = a;
            }
            uint8_t c = (x == 0) ? src_next_row[x] : row1_px;
            uint8_t d;
            if (x < src_width - 1) {
                b = src_next_row[x + 1];
                row1_px = b;
            } else {
                b = c;
            }

            // Compute the four pixels in the destination block
            int dst_index = (2 * y) * dst_width + 2 * x;
            dst[dst_index] = a;                        // a
            dst[dst_index + 1] = (a + b) / 2;          // horizontal interpolation between a and b
            dst[dst_index + dst_width] = (a + c) / 2;  // vertical interpolation between a and c
            dst[dst_index + dst_width + 1] = (a + b + c + d) / 4; // bilinear interpolation
        }
    }
}
