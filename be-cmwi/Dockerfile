# Stage 1: Build
FROM golang:1.24-alpine AS builder

WORKDIR /app

RUN apk add --no-cache git

ENV GOTOOLCHAIN=auto

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server .

# Stage 2: Run
FROM alpine:3.20

RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Jakarta

WORKDIR /app

COPY --from=builder /app/server .

RUN mkdir -p uploads

EXPOSE 8080

CMD ["./server"]
