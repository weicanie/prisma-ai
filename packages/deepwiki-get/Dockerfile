FROM python:3.12-slim AS builder

WORKDIR /app

COPY pyproject.toml README.md .

RUN pip install --no-cache-dir .


FROM python:3.12-slim

WORKDIR /app

RUN apt-get update && \
  apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir playwright && \
  playwright install --with-deps chromium

COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

COPY src/ /app/src/
COPY bin/ /app/bin/
COPY pyproject.toml /app/

RUN chmod +x /app/bin/deepwiki-to-md

ENV PYTHONPATH=/app

ENTRYPOINT ["src/interface/cli.py"]

CMD ["--help"]
