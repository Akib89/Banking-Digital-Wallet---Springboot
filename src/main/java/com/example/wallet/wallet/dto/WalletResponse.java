package com.example.wallet.wallet.dto;

import com.example.wallet.wallet.Wallet;
import com.example.wallet.wallet.WalletStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record WalletResponse(
        UUID id,
        String currency,
        BigDecimal balance,
        WalletStatus status,
        Instant createdAt
) {
    public static WalletResponse from(Wallet wallet) {
        return new WalletResponse(
                wallet.getId(),
                wallet.getCurrency(),
                wallet.getBalance(),
                wallet.getStatus(),
                wallet.getCreatedAt()
        );
    }
}
