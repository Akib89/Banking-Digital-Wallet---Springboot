package com.example.wallet.transfer;

import com.example.wallet.transfer.dto.TransferRequest;
import com.example.wallet.transfer.dto.TransferResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {
    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TransferResponse transfer(@AuthenticationPrincipal Jwt jwt,
                                     @RequestHeader("Idempotency-Key") String idempotencyKey,
                                     @Valid @RequestBody TransferRequest request) {
        return transferService.transfer(userId(jwt), idempotencyKey, request);
    }

    @GetMapping("/{reference}")
    public TransferResponse get(@AuthenticationPrincipal Jwt jwt,
                                @PathVariable String reference) {
        return transferService.get(userId(jwt), reference);
    }

    private UUID userId(Jwt jwt) {
        return UUID.fromString(jwt.getSubject());
    }
}
