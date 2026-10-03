package com.example.wallet.transfer;

import com.example.wallet.common.*;
import com.example.wallet.idempotency.IdempotencyRecord;
import com.example.wallet.idempotency.IdempotencyRecordRepository;
import com.example.wallet.ledger.LedgerEntry;
import com.example.wallet.ledger.LedgerEntryRepository;
import com.example.wallet.ledger.LedgerType;
import com.example.wallet.transfer.dto.TransferRequest;
import com.example.wallet.transfer.dto.TransferResponse;
import com.example.wallet.wallet.Wallet;
import com.example.wallet.wallet.WalletRepository;
import com.example.wallet.wallet.WalletService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;

@Service
public class TransferService {
    private final WalletRepository walletRepository;
    private final TransferRepository transferRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final IdempotencyRecordRepository idempotencyRepository;

    public TransferService(WalletRepository walletRepository,
                           TransferRepository transferRepository,
                           LedgerEntryRepository ledgerEntryRepository,
                           IdempotencyRecordRepository idempotencyRepository) {
        this.walletRepository = walletRepository;
        this.transferRepository = transferRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
        this.idempotencyRepository = idempotencyRepository;
    }

    @Transactional
    public TransferResponse transfer(UUID userId, String idempotencyKey, TransferRequest request) {
        String key = validateKey(idempotencyKey);
        BigDecimal amount = MoneyUtils.positive(request.amount());
        if (request.senderWalletId().equals(request.receiverWalletId())) {
            throw new BadRequestException("Sender and receiver wallets must be different");
        }

        String requestHash = requestHash(request, amount);
        var existing = idempotencyRepository.findByUserIdAndIdempotencyKey(userId, key);
        if (existing.isPresent()) {
            return resolveExisting(existing.get(), requestHash);
        }

        IdempotencyRecord record = new IdempotencyRecord(userId, key, requestHash);
        try {
            idempotencyRepository.saveAndFlush(record);
        } catch (DataIntegrityViolationException ex) {
            throw new ConflictException("Duplicate request detected. Retry with the same Idempotency-Key to obtain the original result.");
        }

        Wallet[] locked = lockInStableOrder(request.senderWalletId(), request.receiverWalletId());
        Wallet sender = locked[0].getId().equals(request.senderWalletId()) ? locked[0] : locked[1];
        Wallet receiver = locked[0].getId().equals(request.receiverWalletId()) ? locked[0] : locked[1];

        if (!sender.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not own the sender wallet");
        }
        WalletService.requireActive(sender);
        WalletService.requireActive(receiver);

        if (!sender.getCurrency().equals(receiver.getCurrency())) {
            throw new BadRequestException("Cross-currency transfers are not supported in V1");
        }
        if (sender.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient balance");
        }

        BigDecimal senderBefore = sender.getBalance();
        BigDecimal receiverBefore = receiver.getBalance();
        sender.setBalance(senderBefore.subtract(amount));
        receiver.setBalance(receiverBefore.add(amount));

        String reference = transferReference();
        Transfer transfer = transferRepository.save(new Transfer(
                reference,
                sender,
                receiver,
                amount,
                request.description()
        ));

        ledgerEntryRepository.save(new LedgerEntry(
                sender,
                transfer,
                reference,
                LedgerType.TRANSFER_OUT,
                amount,
                senderBefore,
                sender.getBalance(),
                request.description()
        ));

        ledgerEntryRepository.save(new LedgerEntry(
                receiver,
                transfer,
                reference,
                LedgerType.TRANSFER_IN,
                amount,
                receiverBefore,
                receiver.getBalance(),
                request.description()
        ));

        record.complete(reference);
        return TransferResponse.from(transfer);
    }

    @Transactional(readOnly = true)
    public TransferResponse get(UUID userId, String reference) {
        Transfer transfer = transferRepository.findByReference(reference)
                .orElseThrow(() -> new NotFoundException("Transfer not found"));
        boolean involved = transfer.getSenderWallet().getUser().getId().equals(userId)
                || transfer.getReceiverWallet().getUser().getId().equals(userId);
        if (!involved) {
            throw new ForbiddenException("You cannot view this transfer");
        }
        return TransferResponse.from(transfer);
    }

    private TransferResponse resolveExisting(IdempotencyRecord record, String requestHash) {
        if (!record.getRequestHash().equals(requestHash)) {
            throw new ConflictException("Idempotency-Key was already used for a different request");
        }
        if (record.getTransferReference() == null) {
            throw new ConflictException("A request with this Idempotency-Key is still processing");
        }
        Transfer transfer = transferRepository.findByReference(record.getTransferReference())
                .orElseThrow(() -> new ConflictException("Original transfer result is unavailable"));
        return TransferResponse.from(transfer);
    }

    private Wallet[] lockInStableOrder(UUID a, UUID b) {
        UUID firstId = a.toString().compareTo(b.toString()) < 0 ? a : b;
        UUID secondId = firstId.equals(a) ? b : a;
        Wallet first = walletRepository.findByIdForUpdate(firstId)
                .orElseThrow(() -> new NotFoundException("Wallet not found: " + firstId));
        Wallet second = walletRepository.findByIdForUpdate(secondId)
                .orElseThrow(() -> new NotFoundException("Wallet not found: " + secondId));
        return new Wallet[]{first, second};
    }

    private String validateKey(String key) {
        if (key == null || key.isBlank()) {
            throw new BadRequestException("Idempotency-Key header is required");
        }
        String trimmed = key.trim();
        if (trimmed.length() > 100) {
            throw new BadRequestException("Idempotency-Key must be 100 characters or fewer");
        }
        return trimmed;
    }

    private String requestHash(TransferRequest request, BigDecimal normalizedAmount) {
        String canonical = request.senderWalletId() + "|" + request.receiverWalletId() + "|"
                + normalizedAmount.toPlainString() + "|" + (request.description() == null ? "" : request.description().trim());
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(canonical.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 unavailable", ex);
        }
    }

    private String transferReference() {
        return "TRX-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase(Locale.ROOT);
    }
}
