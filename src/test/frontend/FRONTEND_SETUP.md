# VaultPay frontend setup

This package is designed to be extracted directly into the root of the existing Spring Boot Digital Wallet project.

After extraction, your project should look like:

```text
digital-wallet-backend/
├── pom.xml
├── Dockerfile
├── src/
├── frontend/
│   ├── package.json
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
└── docker-compose.fullstack.yml
```

## Recommended: run everything with Docker

From the Spring Boot project root:

```cmd
docker compose down
```

Then:

```cmd
docker compose -f docker-compose.fullstack.yml up -d --build
```

Open:

- Frontend: http://localhost:3000
- Backend Swagger: http://localhost:8080/swagger-ui/index.html

Check status:

```cmd
docker compose -f docker-compose.fullstack.yml ps
```

You should see `frontend`, `app`, and `postgres` as Up.

The frontend Nginx server proxies `/api/*` to the Spring Boot container (`app:8080`). This means no backend CORS change is required for the Docker setup.

## Development mode without Docker for the frontend

Keep the Spring Boot backend running on port 8080. Then open a second terminal:

```cmd
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

Vite proxies `/api` to `http://localhost:8080`, so no CORS change is required in development either.

## API features wired into the UI

- Register: POST `/api/auth/register`
- Login: POST `/api/auth/login`
- My wallets: GET `/api/wallets/me`
- Create wallet: POST `/api/wallets`
- Deposit: POST `/api/wallets/{walletId}/deposit`
- Withdraw: POST `/api/wallets/{walletId}/withdraw`
- Transfer: POST `/api/transfers` with `Idempotency-Key`
- Transactions: GET `/api/wallets/{walletId}/transactions`

## Notes

- The UI stores the JWT response in browser `localStorage` for this portfolio implementation.
- Deposit is clearly presented as simulated test funding because the backend is not connected to a real payment processor.
- Transfers require the receiver wallet UUID because the current backend does not have a recipient lookup endpoint.
- The transfer page keeps the same idempotency key when a request errors and the form has not changed, reducing accidental duplicate transfers on retry.
