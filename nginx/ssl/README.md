# SSL Certificates for Local Development

## Quick Setup

For local development, generate self-signed certificates:

```bash
# On Linux/Mac:
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout localhost.key \
  -out localhost.crt \
  -subj "/C=US/ST=Development/L=Local/O=Clenergize/OU=Development/CN=localhost"

# On Windows (PowerShell):
# Install OpenSSL from https://slproweb.com/products/Win32OpenSSL.html
# Then run the same command above
```

## Using Docker

Alternatively, generate certificates using Docker:

```bash
docker run --rm -v "$(pwd)/nginx/ssl:/certs" alpine/openssl req \
  -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /certs/localhost.key \
  -out /certs/localhost.crt \
  -subj "/C=US/ST=Development/L=Local/O=Clenergize/OU=Development/CN=localhost"
```

## Expected Files

- `localhost.crt` - Self-signed certificate
- `localhost.key` - Private key

## Production

For production, use Let's Encrypt or your organization's certificate authority.
