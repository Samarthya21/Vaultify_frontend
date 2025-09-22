# Setup Instructions

## Backend

### Prerequisites
- Go 1.23+
- Docker & Docker Compose
- PostgreSQL database

### Steps
1. **Clone the repository**
2. **Install Go dependencies:**
   ```sh
   go mod download
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in required values (DB, MinIO, JWT secret, etc).
4. **Run database migrations:**
   - Use a migration tool or run the SQL files in `migrations/` manually on your PostgreSQL instance.
5. **Start MinIO (S3-compatible storage):**
   ```sh
   docker-compose up minio
   ```
6. **Run the backend server:**
   ```sh
   go run main.go
   ```

## Frontend
No frontend code is present in this repository. Integrate with the backend API as needed.

---

For more details, see the README.
