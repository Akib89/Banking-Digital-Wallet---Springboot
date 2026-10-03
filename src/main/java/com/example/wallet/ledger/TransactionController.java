package com.example.wallet.ledger;

import com.example.wallet.ledger.dto.LedgerEntryResponse;
import com.example.wallet.wallet.WalletService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/wallets/{walletId}/transactions")
public class TransactionController {
    private final WalletService walletService;
    private final LedgerEntryRepository ledgerEntryRepository;

    public TransactionController(WalletService walletService,
                                 LedgerEntryRepository ledgerEntryRepository) {
        this.walletService = walletService;
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @GetMapping
    public Page<LedgerEntryResponse> history(@AuthenticationPrincipal Jwt jwt,
                                             @PathVariable UUID walletId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        UUID userId = UUID.fromString(jwt.getSubject());
        walletService.requireOwned(userId, walletId);
        int safeSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(Math.max(page, 0), safeSize);
        return ledgerEntryRepository.findByWalletIdOrderByCreatedAtDesc(walletId, pageable)
                .map(LedgerEntryResponse::from);
    }
}
