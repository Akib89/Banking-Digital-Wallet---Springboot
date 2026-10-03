package com.example.wallet.transfer;

import com.example.wallet.wallet.Wallet;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "transfers")
public class Transfer {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true, length = 40)
    private String reference;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_wallet_id", nullable = false)
    private Wallet senderWallet;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_wallet_id", nullable = false)
    private Wallet receiverWallet;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TransferStatus status;

    @Column(length = 255)
    private String description;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "completed_at")
    private Instant completedAt;

    protected Transfer() {}

    public Transfer(String reference, Wallet senderWallet, Wallet receiverWallet,
                    BigDecimal amount, String description) {
        this.id = UUID.randomUUID();
        this.reference = reference;
        this.senderWallet = senderWallet;
        this.receiverWallet = receiverWallet;
        this.amount = amount;
        this.currency = senderWallet.getCurrency();
        this.status = TransferStatus.SUCCESS;
        this.description = description;
        this.createdAt = Instant.now();
        this.completedAt = this.createdAt;
    }

    public UUID getId() { return id; }
    public String getReference() { return reference; }
    public Wallet getSenderWallet() { return senderWallet; }
    public Wallet getReceiverWallet() { return receiverWallet; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public TransferStatus getStatus() { return status; }
    public String getDescription() { return description; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getCompletedAt() { return completedAt; }
}
