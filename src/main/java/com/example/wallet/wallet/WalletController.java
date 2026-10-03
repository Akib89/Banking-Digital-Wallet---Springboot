package com.example.wallet.wallet;

import com.example.wallet.wallet.dto.CreateWalletRequest;
import com.example.wallet.wallet.dto.MoneyRequest;
import com.example.wallet.wallet.dto.WalletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/wallets")
public class WalletController {
    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WalletResponse create(@AuthenticationPrincipal Jwt jwt,
                                 @Valid @RequestBody CreateWalletRequest request) {
        return walletService.create(userId(jwt), request.currency());
    }

    @GetMapping("/me")
    public List<WalletResponse> mine(@AuthenticationPrincipal Jwt jwt) {
        return walletService.mine(userId(jwt));
    }

    @PostMapping("/{walletId}/deposit")
    public WalletResponse deposit(@AuthenticationPrincipal Jwt jwt,
                                  @PathVariable UUID walletId,
                                  @Valid @RequestBody MoneyRequest request) {
        return walletService.deposit(userId(jwt), walletId, request.amount());
    }

    @PostMapping("/{walletId}/withdraw")
    public WalletResponse withdraw(@AuthenticationPrincipal Jwt jwt,
                                   @PathVariable UUID walletId,
                                   @Valid @RequestBody MoneyRequest request) {
        return walletService.withdraw(userId(jwt), walletId, request.amount());
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
