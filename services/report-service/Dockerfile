FROM node:22-alpine
WORKDIR /app
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci
COPY --chown=node:node prisma ./prisma
RUN npx prisma generate
COPY --chown=node:node src ./src
ENV NODE_ENV=production
USER node
EXPOSE 4002
CMD ["npm", "run", "start:container"]
