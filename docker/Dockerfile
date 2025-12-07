FROM kalilinux/kali-rolling

ENV DEBIAN_FRONTEND=noninteractive

RUN printf 'deb http://http.kali.org/kali kali-rolling main non-free contrib\ndeb http://archive.kali.org/kali kali-rolling main non-free contrib\n' | tee /etc/apt/sources.list >/dev/null && \
    apt-get update -o Acquire::Retries=5 -o Acquire::ForceIPv4=true && \
    apt-get install -y --no-install-recommends kali-linux-headless nodejs npm git gobuster dnstwist python3-pip wget unzip build-essential python3-dev golang && \
    wget -q https://github.com/bee-san/RustScan/releases/download/2.4.1/rustscan.deb.zip -O /tmp/rustscan.deb.zip && \
    unzip /tmp/rustscan.deb.zip -d /tmp && \
    apt-get install -y /tmp/rustscan*.deb && \
    rm /tmp/rustscan.deb.zip /tmp/rustscan*.deb && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

RUN GOBIN=/usr/local/bin go install github.com/sensepost/gowitness@latest

RUN git clone https://github.com/x0rz/phishing_catcher.git /opt/phishing_catcher && \
    sed -i 's/python_Levenshtein==0.12.0/Levenshtein/' /opt/phishing_catcher/requirements.txt && \
    sed -i 's/==.*//' /opt/phishing_catcher/requirements.txt && \
    pip install --break-system-packages -r /opt/phishing_catcher/requirements.txt && \
    printf '#!/bin/bash\ncd /opt/phishing_catcher && python3 catch_phishing.py "$@"\n' > /usr/local/bin/phishing_catcher && \
    chmod +x /usr/local/bin/phishing_catcher

WORKDIR /app

ADD https://api.github.com/repos/felipevasc/estrutura/commits/main version.json

RUN git clone --depth 1 https://github.com/felipevasc/estrutura

WORKDIR /app/estrutura

RUN npm ci

RUN printf 'DATABASE_URL="file:./store.db"\n' > .env

RUN npx prisma generate

RUN npx prisma migrate deploy

ENTRYPOINT ["npm", "run", "dev"]
