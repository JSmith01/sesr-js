#include <stdint.h>
#include <stdlib.h>

// Function to perform horizontal scaling of a single row using SIMD
void scale_row_horizontal(const uint8_t* src_row, int width, uint8_t* dst_row) {
    const size_t dst_width = 2 * width;
    const uint8_t shuffle_mask[32] = { // Shuffle mask for interleaving original and averages
        0, 16, 1, 17,
        2, 18, 3, 19,
        4, 20, 5, 21,
        6, 22, 7, 23,
        8, 24, 9, 25,
        10, 26, 11, 27,
        12, 28, 13, 29,
        14, 30, 15, 31
    };

    for (int i = 0; i < width; ) {
        if ((width - i) >= 16) { // Process a full 16-byte chunk with SIMD
            v128_t vec_current = wasm_v128_load(src_row + i);
            v128_t vec_next = wasm_v128_load(src_row + i + 1);

            v128_t sum_vec = wasm_v8x16_add(vec_current, vec_next);
            v128_t avg_vec = wasm_v8x16_shr_s(sum_vec, 1); // Divide by 2

            v128_t interleaved = wasm_v8x16_shuffle(
                vec_current,
                avg_vec,
                shuffle_mask
            );

            wasm_v128_store(dst_row + (i * 2), interleaved);
            i += 16;
        } else { // Handle remaining elements with scalar code
            for (; i < width; ++i) {
                dst_row[2*i] = src_row[i];
                if (i < width - 1)
                    dst_row[2*i + 1] = (src_row[i] + src_row[i+1]) / 2;
                else
                    dst_row[2*i + 1] = src_row[i];
            }
        }
    }
}

// Function to upscale the entire image by a factor of 2 using bilinear interpolation with SIMD
void upscale_image_simd(const uint8_t* src, int width, int height,
                        uint8_t* dst) {
    size_t intermediate_width = 2 * width;
    size_t intermediate_height = height;

    // Allocate memory for the intermediate horizontally scaled image
    uint8_t* temp_intermediate = (uint8_t*)malloc(intermediate_width * intermediate_height);

    if (!temp_intermediate)
        return; // Handle error

    // Perform horizontal scaling on each row
    for (int row = 0; row < height; ++row) {
        const uint8_t* src_row = &src[row * width];
        uint8_t* dst_row = &temp_intermediate[row * intermediate_width];

        scale_row_horizontal(src_row, width, dst_row);
    }

    // Perform vertical scaling on the intermediate image to get final result
    size_t final_height = 2 * height;
    for (int dest_row = 0; dest_row < final_height; ++dest_row) {
        int src_row_base = dest_row / 2;

        if (dest_row % 2 == 0) { // Copy the original row from intermediate
            const uint8_t* src_row = &temp_intermediate[src_row_base * intermediate_width];
            uint8_t* dst_row_ptr = &dst[dest_row * intermediate_width];

            for (int i = 0; i < intermediate_width; i += 16) {
                v128_t vec_current = wasm_v128_load(src_row + i);
                wasm_v128_store(dst_row_ptr + i, vec_current);
            }
        } else { // Compute average between current and next row
            const uint8_t* src_row0 = &temp_intermediate[src_row_base * intermediate_width];
            int next_row_idx = src_row_base + 1;
            const uint8_t* src_row1 = (next_row_idx < intermediate_height) ?
                &temp_intermediate[next_row_idx * intermediate_width] :
                src_row0; // Handle edge case

            uint8_t* dst_row_ptr = &dst[dest_row * intermediate_width];

            for (int i = 0; i < intermediate_width; i += 16) {
                v128_t vec_A = wasm_v128_load(src_row0 + i);
                v128_t vec_B = wasm_v128_load(src_row1 + i);

                v128_t avg_vec = wasm_v8x16_shr_s(
                    wasm_v8x16_add(vec_A, vec_B),
                    1 // Divide by 2
                );

                wasm_v128_store(dst_row_ptr + i, avg_vec);
            }
        }
    }

    free(temp_intermediate); // Free intermediate buffer
}
