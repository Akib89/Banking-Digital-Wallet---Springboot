package com.example.wallet.wallet;

import com.example.wallet.user.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "wallets", uniqueConstraints = @UniqueConstraint(name = "uk_wallet_user_currency", columnNames = {"user_id", "currency"}))
public class Wallet {
    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WalletStatus status;

    @Version
    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Wallet() {}

    public Wallet(User user, String currency) {
        this.id = UUID.randomUUID();
        this.user = user;
        this.currency = currency;
        this.balance = new BigDecimal("0.00");
        this.status = WalletStatus.ACTIVE;
        this.createdAt = Instant.now();
    }

    public UUID getId() { return id; }
    public User getUser() { return user; }
    public String getCurrency() { return currency; }
    public BigDecimal getBalance() { return balance; }
    public WalletStatus getStatus() { return status; }
    public long getVersion() { return version; }
    public Instant getCreatedAt() { return createdAt; }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
