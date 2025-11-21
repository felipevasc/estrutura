FROM kalilinux/kali-rolling

RUN apt update && apt -y install kali-linux-headless

RUN apt install nodejs npm -y

RUN apt install git -y

WORKDIR /app

RUN git clone https://github.com/felipevasc/estrutura

WORKDIR /app/estrutura

RUN npm install

RUN echo "DATABASE_URL=\"file:./store.db\"" > .env

RUN npx prisma generate

RUN npx prisma migrate dev --name init

ENTRYPOINT ["npm", "run", "dev"]