package com.example.wallet.transfer.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.util.UUID;

public record TransferRequest(
        @NotNull UUID senderWalletId,
        @NotNull UUID receiverWalletId,
        @NotNull @DecimalMin("0.01") @Digits(integer = 17, fraction = 2) BigDecimal amount,
        @Size(max = 255) String description
) {}
