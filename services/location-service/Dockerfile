FROM node:22-alpine

# Upgrade npm to resolve vulnerability in global tar dependency (CVE-2026-59873)
RUN npm install -g npm@12.0.2

# Configure npm to allow install scripts globally
RUN npm config set allow-scripts "@prisma/client,@prisma/engines,prisma,bcrypt"

WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node prisma ./prisma
RUN npx prisma generate
COPY --chown=node:node src ./src
ENV NODE_ENV=production
USER node
EXPOSE 4003
CMD ["npm", "run", "start:container"]
