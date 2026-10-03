package com.example.wallet.transfer.dto;

import com.example.wallet.transfer.Transfer;
import com.example.wallet.transfer.TransferStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransferResponse(
        String reference,
        UUID senderWalletId,
        UUID receiverWalletId,
        BigDecimal amount,
        String currency,
        TransferStatus status,
        String description,
        Instant completedAt
) {
    public static TransferResponse from(Transfer transfer) {
        return new TransferResponse(
                transfer.getReference(),
                transfer.getSenderWallet().getId(),
                transfer.getReceiverWallet().getId(),
                transfer.getAmount(),
                transfer.getCurrency(),
                transfer.getStatus(),
                transfer.getDescription(),
                transfer.getCompletedAt()
        );
    }
}
