FROM mcr.microsoft.com/vscode/devcontainers/base:bullseye

WORKDIR /opt

ENV RYE_HOME="/opt/rye"
ENV PATH="$RYE_HOME/shims:$PATH"

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        libwebkit2gtk-4.0-dev && \
    rm -rf /var/lib/apt/lists/*

SHELL [ "/bin/bash", "-o", "pipefail", "-c" ]
RUN curl -sSf https://rye.astral.sh/get | RYE_INSTALL_OPTION="--yes" bash && \
    rye config --set-bool behavior.global-python=true && \
    rye config --set-bool behavior.use-uv=true && \
    chown -R vscode $RYE_HOME

COPY ../.python-version ../pyproject.toml ../README.md ./
RUN rye pin $(cat .python-version) && \
    rye sync

# # rye syncでpipコマンドが利用できるようにならないので、pipを入れる
# RUN python -m ensurepip --upgrade

# # rye syncでplaywrightコマンドが利用できるようにならないので、pipで入れ直す
# RUN pip install --no-cache-dir playwright pytest-playwright && \
#     playwright install && \
#     playwright install-deps

RUN source .venv/bin/activate && \
    playwright install && \
    playwright install-deps

