FROM node:slim

RUN apt-get update || : && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install scikit-learn using pip
RUN pip3 install --break-system-packages -U scikit-learn

WORKDIR /usr/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "start" ]