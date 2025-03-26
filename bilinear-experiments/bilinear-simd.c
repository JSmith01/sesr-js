#include <stdint.h>
#include <wasm_simd128.h>

#define export __attribute__( ( visibility( "default" ) ) )
#define ALIGN16_PTR(ptr) ((v128_t *)((uintptr_t)(ptr) & ~15))

// assumes width is divisible by 16
export void bilinear_upscale_simd(uint8_t * src, int src_width, int src_height, uint8_t *dst) {
    int dst_width = src_width * 2;
    int dst_height = src_height * 2;

    for (int y = 0; y < src_height; y++) {
        uint8_t *src_row = &src[y * src_width];
        uint8_t *src_next_row = (y < src_height - 1) ? &src[(y + 1) * src_width] : src_row;

        // Pre-load first vectors
        v128_t curr_a = wasm_v128_load(ALIGN16_PTR(src_row));
        v128_t curr_c = wasm_v128_load(ALIGN16_PTR(src_next_row));
        
        for (int x = 0; x < src_width; x += 16) {
            v128_t a = curr_a;
            v128_t c = curr_c;
            
            // Pre-load next aligned vectors for next iteration
            if (x < src_width - 16) {
                curr_a = wasm_v128_load(ALIGN16_PTR(src_row + x + 16));
                curr_c = wasm_v128_load(ALIGN16_PTR(src_next_row + x + 16));
            }

            // Create b and d by shifting current and next vectors
            v128_t b;
            if (x < src_width - 16) {
                b = wasm_i8x16_shuffle(a, curr_a, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
            } else {
                b = wasm_i8x16_shuffle(a, a, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15);
            }

            v128_t d;
            if (x < src_width - 16) {
                d = wasm_i8x16_shuffle(c, curr_c, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16);
            } else {
                d = wasm_i8x16_shuffle(c, c, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 15);
            }

            // Calculate interpolated values
            v128_t ab_avg = wasm_u8x16_avgr(a, b);
            v128_t ac_avg = wasm_u8x16_avgr(a, c);
            
            // For diagonal interpolation (a + b + c + d) / 4
            v128_t ab_low = wasm_u16x8_extend_low_u8x16(a);
            v128_t ab_high = wasm_u16x8_extend_high_u8x16(a);
            v128_t b_low = wasm_u16x8_extend_low_u8x16(b);
            v128_t b_high = wasm_u16x8_extend_high_u8x16(b);
            v128_t c_low = wasm_u16x8_extend_low_u8x16(c);
            v128_t c_high = wasm_u16x8_extend_high_u8x16(c);
            v128_t d_low = wasm_u16x8_extend_low_u8x16(d);
            v128_t d_high = wasm_u16x8_extend_high_u8x16(d);

            // Sum all values
            v128_t sum_low = wasm_i16x8_add(ab_low, b_low);
            sum_low = wasm_i16x8_add(sum_low, c_low);
            sum_low = wasm_i16x8_add(sum_low, d_low);

            v128_t sum_high = wasm_i16x8_add(ab_high, b_high);
            sum_high = wasm_i16x8_add(sum_high, c_high);
            sum_high = wasm_i16x8_add(sum_high, d_high);

            // Divide by 4
            sum_low = wasm_i16x8_shr(sum_low, 2);
            sum_high = wasm_i16x8_shr(sum_high, 2);

            // Pack back to 8-bit
            v128_t abcd_avg = wasm_u8x16_narrow_i16x8(sum_low, sum_high);

            // Interleave values for the top row (a and ab_avg)
            v128_t top_row_low = wasm_i8x16_shuffle(a, ab_avg, 0, 16, 1, 17, 2, 18, 3, 19, 4, 20, 5, 21, 6, 22, 7, 23);
            v128_t top_row_high = wasm_i8x16_shuffle(a, ab_avg, 8, 24, 9, 25, 10, 26, 11, 27, 12, 28, 13, 29, 14, 30, 15, 31);

            // Interleave values for the bottom row (ac_avg and abcd_avg)
            v128_t bottom_row_low = wasm_i8x16_shuffle(ac_avg, abcd_avg, 0, 16, 1, 17, 2, 18, 3, 19, 4, 20, 5, 21, 6, 22, 7, 23);
            v128_t bottom_row_high = wasm_i8x16_shuffle(ac_avg, abcd_avg, 8, 24, 9, 25, 10, 26, 11, 27, 12, 28, 13, 29, 14, 30, 15, 31);

            // Store interleaved results
            int dst_index = (2 * y) * dst_width + 2 * x;
            v128_t *out_aligned = ALIGN16_PTR(dst + dst_index);
            v128_t *out2_aligned = ALIGN16_PTR((uint8_t *)out_aligned + dst_width);
            wasm_v128_store(out_aligned, top_row_low);
            wasm_v128_store(out_aligned + 1, top_row_high);
            wasm_v128_store(out2_aligned, bottom_row_low);
            wasm_v128_store(out2_aligned + 1, bottom_row_high);
        }
    }
}
