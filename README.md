# Digital Wallet Backend

A CV-ready Spring Boot digital wallet backend focused on transaction correctness rather than UI.

## Stack

- Java 21
- Spring Boot 4.1.1
- Spring Security 7 / JWT
- Spring Data JPA / Hibernate
- PostgreSQL
- Flyway
- Swagger/OpenAPI
- Docker / Docker Compose
- JUnit

## V1 features

- User registration and login
- Stateless JWT authentication
- One wallet per user per ISO-4217 currency
- Simulated deposits and withdrawals
- Wallet-to-wallet transfers
- BigDecimal money handling
- Atomic `@Transactional` transfer processing
- Pessimistic row locks with deterministic lock order
- Optimistic `@Version` field on wallets
- Idempotency keys for transfers
- Ledger entries with before/after balances
- Transaction history with pagination
- Swagger UI
- Flyway database migrations

> Deposits and withdrawals are intentionally simulated. This project does not connect to a real bank, card network, or payment processor.

## Run with Docker

```bash
docker compose up --build
```

Then open:

- Swagger UI: http://localhost:8080/swagger-ui.html
- Health: http://localhost:8080/actuator/health

## Run locally

Start PostgreSQL:

```bash
docker compose up -d postgres
```

Then run:

```bash
mvn spring-boot:run
```

## Suggested test flow

1. Register Alice and copy her JWT.
2. Create a BDT wallet for Alice.
3. Deposit 10,000 BDT into Alice's wallet.
4. Register Bob and create a BDT wallet for Bob.
5. Log back in as Alice.
6. POST `/api/transfers` with Alice's wallet as sender, Bob's as receiver, and a unique `Idempotency-Key` header.
7. Repeat the exact same request with the exact same idempotency key. The API returns the original transfer rather than charging twice.
8. Inspect `/api/wallets/{walletId}/transactions`.

## Important design choices

### Money

`BigDecimal` + `NUMERIC(19,2)` are used instead of floating-point types.

### Atomicity

A transfer executes inside one database transaction. Debit, credit, transfer record, ledger records, and idempotency result commit together or roll back together.

### Concurrency

Both wallet rows are locked with `PESSIMISTIC_WRITE`. Wallet IDs are locked in stable order to reduce deadlock risk.

### Idempotency

Each transfer requires an `Idempotency-Key`. Reusing the key for the same request returns the original result. Reusing it for a different request returns HTTP 409.

## Good next features

- Refresh tokens
- Admin RBAC and wallet freezing
- Daily/per-transfer limits
- Beneficiaries
- Redis-backed rate limiting
- Kafka notification events
- Reversals/refunds
- Double-entry accounting model
- Integration and concurrency tests with Testcontainers
- CI/CD with GitHub Actions
