package com.example.wallet.ledger.dto;

import com.example.wallet.ledger.LedgerEntry;
import com.example.wallet.ledger.LedgerStatus;
import com.example.wallet.ledger.LedgerType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LedgerEntryResponse(
        UUID id,
        String reference,
        LedgerType type,
        BigDecimal amount,
        BigDecimal balanceBefore,
        BigDecimal balanceAfter,
        LedgerStatus status,
        String description,
        Instant createdAt
) {
    public static LedgerEntryResponse from(LedgerEntry entry) {
        return new LedgerEntryResponse(
                entry.getId(),
                entry.getReference(),
                entry.getType(),
                entry.getAmount(),
                entry.getBalanceBefore(),
                entry.getBalanceAfter(),
                entry.getStatus(),
                entry.getDescription(),
                entry.getCreatedAt()
        );
    }
}
