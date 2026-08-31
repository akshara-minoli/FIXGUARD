FROM node:22-alpine

# Upgrade npm to resolve vulnerability in global tar dependency (CVE-2026-59873)
RUN npm install -g npm@12.0.2

WORKDIR /app
COPY --from=fixguard-prisma-engines:6.19.0 --chown=node:node /schema-engine-linux-musl-openssl-3.0.x /opt/prisma-engines/schema-engine-linux-musl-openssl-3.0.x
COPY --from=fixguard-prisma-engines:6.19.0 --chown=node:node /libquery_engine-linux-musl-openssl-3.0.x.so.node /opt/prisma-engines/libquery_engine-linux-musl-openssl-3.0.x.so.node
ENV PRISMA_SCHEMA_ENGINE_BINARY=/opt/prisma-engines/schema-engine-linux-musl-openssl-3.0.x \
    PRISMA_QUERY_ENGINE_LIBRARY=/opt/prisma-engines/libquery_engine-linux-musl-openssl-3.0.x.so.node
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node prisma ./prisma
RUN npx prisma generate
COPY --chown=node:node src ./src
ENV NODE_ENV=production
USER node
EXPOSE 4002
CMD ["npm", "run", "start:container"]
