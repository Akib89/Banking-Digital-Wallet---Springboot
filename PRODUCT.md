# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is the project owner using VaultPay as a practice project to learn and demonstrate full-stack digital wallet implementation.

## Product Purpose

VaultPay is a practice digital wallet application for registering users, authenticating with JWT, creating wallets, simulating deposits and withdrawals, transferring money between wallets, and inspecting transaction history. Success means the project demonstrates correct wallet behavior and understandable full-stack implementation rather than production banking readiness.

## Positioning

The project emphasizes transaction correctness: precise money handling, atomic transfer processing, stable locking, idempotency for transfers, ledger records, and database migrations.

## Operating Context

The product is evaluated as a local development/demo application. The backend exposes REST APIs and Swagger/OpenAPI, while the React frontend provides authenticated dashboard, transactions, wallet detail, and send-money flows.

## Capabilities and Constraints

Confirmed capabilities include user registration and login, JWT authentication, one wallet per user per ISO-4217 currency, simulated deposits and withdrawals, wallet-to-wallet transfers, idempotent transfer submission, ledger-backed transaction history, pagination, and PostgreSQL persistence.

Deposits and withdrawals are simulated. The project does not connect to a real bank, card network, or payment processor. Future work must not imply real-money movement or production financial integration unless that capability is actually added.

## Brand Commitments

The current frontend identifies the product as VaultPay with the subtitle "Digital wallet." No additional durable brand constraints are confirmed.

## Evidence on Hand

Repository evidence includes README.md, Spring Boot source under src/main/java, Flyway migration files, Docker configuration, and the Vite/React frontend under frontend. No real customer evidence, testimonials, production metrics, or regulated financial claims are present.

## Product Principles

Prioritize correctness over presentation when tradeoffs arise.

Keep financial claims honest and avoid suggesting real banking capabilities that do not exist.

Make wallet state, transaction history, and transfer outcomes easy to inspect during demos.

Preserve simple local setup so the project remains useful for practice and learning.
