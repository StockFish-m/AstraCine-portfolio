package com.astracine.backend.presentation.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PayOSCreateRequest {

    @NotBlank(message = "holdId không được để trống")
    private String holdId;

    /** URL PayOS redirect về sau khi thanh toán thành công */
    @NotBlank(message = "returnUrl không được để trống")
    private String returnUrl;

    /** URL PayOS redirect về sau khi huỷ thanh toán */
    @NotBlank(message = "cancelUrl không được để trống")
    private String cancelUrl;
}
