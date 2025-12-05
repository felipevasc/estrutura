FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive

RUN printf 'deb http://kali.download/kali kali-rolling main non-free contrib\n' > /etc/apt/sources.list && \
    apt update && \
    apt install -y kali-linux-headless nodejs npm git gobuster dnstwist python3-pip wget unzip && \
    wget -q https://github.com/bee-san/RustScan/releases/download/2.4.1/rustscan.deb.zip -O /tmp/rustscan.deb.zip && \
    unzip /tmp/rustscan.deb.zip -d /tmp && \
    apt install -y /tmp/rustscan_2.4.1_amd64.deb && \
    rm /tmp/rustscan.deb.zip /tmp/rustscan_2.4.1_amd64.deb && \
    apt clean && rm -rf /var/lib/apt/lists/*

RUN pip install git+https://github.com/x0rz/phishing_catcher.git && printf '#!/bin/bash\npython -m phishing_catcher "$@"\n' > /usr/local/bin/phishing_catcher && chmod +x /usr/local/bin/phishing_catcher

WORKDIR /app

ADD https://api.github.com/repos/felipevasc/estrutura/commits/main version.json

RUN git clone --depth 1 https://github.com/felipevasc/estrutura

WORKDIR /app/estrutura

RUN npm ci

RUN printf 'DATABASE_URL="file:./store.db"\n' > .env

RUN npx prisma generate

RUN npx prisma migrate deploy

ENTRYPOINT ["npm", "run", "dev"]
