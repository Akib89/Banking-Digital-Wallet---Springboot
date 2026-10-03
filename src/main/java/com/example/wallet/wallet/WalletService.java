package com.example.wallet.wallet;

import com.example.wallet.common.*;
import com.example.wallet.ledger.LedgerEntry;
import com.example.wallet.ledger.LedgerEntryRepository;
import com.example.wallet.ledger.LedgerType;
import com.example.wallet.user.User;
import com.example.wallet.user.UserRepository;
import com.example.wallet.wallet.dto.WalletResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Currency;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class WalletService {
    private final WalletRepository walletRepository;
    private final UserRepository userRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    public WalletService(WalletRepository walletRepository,
                         UserRepository userRepository,
                         LedgerEntryRepository ledgerEntryRepository) {
        this.walletRepository = walletRepository;
        this.userRepository = userRepository;
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Transactional
    public WalletResponse create(UUID userId, String requestedCurrency) {
        String currency = normalizeCurrency(requestedCurrency);
        if (walletRepository.existsByUserIdAndCurrency(userId, currency)) {
            throw new ConflictException("A wallet for this currency already exists");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));
        return WalletResponse.from(walletRepository.save(new Wallet(user, currency)));
    }

    @Transactional(readOnly = true)
    public List<WalletResponse> mine(UUID userId) {
        return walletRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(WalletResponse::from).toList();
    }

    @Transactional
    public WalletResponse deposit(UUID userId, UUID walletId, BigDecimal rawAmount) {
        BigDecimal amount = MoneyUtils.positive(rawAmount);
        Wallet wallet = lockOwnedWallet(userId, walletId);
        BigDecimal before = wallet.getBalance();
        BigDecimal after = before.add(amount);
        wallet.setBalance(after);
        ledgerEntryRepository.save(new LedgerEntry(
                wallet, null, reference("DEP"), LedgerType.DEPOSIT,
                amount, before, after, "Simulated deposit"
        ));
        return WalletResponse.from(wallet);
    }

    @Transactional
    public WalletResponse withdraw(UUID userId, UUID walletId, BigDecimal rawAmount) {
        BigDecimal amount = MoneyUtils.positive(rawAmount);
        Wallet wallet = lockOwnedWallet(userId, walletId);
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new BadRequestException("Insufficient balance");
        }
        BigDecimal before = wallet.getBalance();
        BigDecimal after = before.subtract(amount);
        wallet.setBalance(after);
        ledgerEntryRepository.save(new LedgerEntry(
                wallet, null, reference("WDR"), LedgerType.WITHDRAWAL,
                amount, before, after, "Simulated withdrawal"
        ));
        return WalletResponse.from(wallet);
    }

    @Transactional(readOnly = true)
    public Wallet requireOwned(UUID userId, UUID walletId) {
        return walletRepository.findByIdAndUserId(walletId, userId)
                .orElseThrow(() -> new NotFoundException("Wallet not found"));
    }

    private Wallet lockOwnedWallet(UUID userId, UUID walletId) {
        Wallet wallet = walletRepository.findByIdForUpdate(walletId)
                .orElseThrow(() -> new NotFoundException("Wallet not found"));
        if (!wallet.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You do not own this wallet");
        }
        requireActive(wallet);
        return wallet;
    }

    public static void requireActive(Wallet wallet) {
        if (wallet.getStatus() != WalletStatus.ACTIVE) {
            throw new BadRequestException("Wallet is not active");
        }
    }

    private String normalizeCurrency(String raw) {
        String code = raw.trim().toUpperCase(Locale.ROOT);
        try {
            Currency.getInstance(code);
            return code;
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported ISO-4217 currency code");
        }
    }

    private String reference(String prefix) {
        return prefix + "-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT);
    }
}
