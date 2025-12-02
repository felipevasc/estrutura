FROM kalilinux/kali-rolling

RUN apt update && apt -y install kali-linux-headless

RUN apt install nodejs npm -y

RUN apt install git -y

RUN apt install rustscan -y

RUN apt install gobuster -y

RUN apt install dnstwist -y

RUN apt install python3-pip -y

RUN pip install git+https://github.com/x0rz/phishing_catcher.git && echo '#!/bin/bash\npython -m phishing_catcher "$@"' > /usr/local/bin/phishing_catcher && chmod +x /usr/local/bin/phishing_catcher

WORKDIR /app

# Forçar atualização dessas etapas sempre que houver novo commit
ADD https://api.github.com/repos/felipevasc/estrutura/commits/main version.json

RUN git clone https://github.com/felipevasc/estrutura

WORKDIR /app/estrutura

RUN npm install

RUN echo "DATABASE_URL=\"file:./store.db\"" > .env

RUN npx prisma generate

RUN npx prisma migrate dev --name init

ENTRYPOINT ["npm", "run", "dev"]
