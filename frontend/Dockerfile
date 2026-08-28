FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Production uses same-origin Ingress routes. Local development can override
# these through frontend/.env or explicit build arguments.
ARG VITE_AUTH_API_URL=
ARG VITE_REPORT_API_URL=
ARG VITE_LOCATION_API_URL=
ARG VITE_ASSIGNMENT_API_URL=
ARG VITE_NOTIFICATION_API_URL=
ARG VITE_ANALYTICS_API_URL=
ENV VITE_AUTH_API_URL=$VITE_AUTH_API_URL \
    VITE_REPORT_API_URL=$VITE_REPORT_API_URL \
    VITE_LOCATION_API_URL=$VITE_LOCATION_API_URL \
    VITE_ASSIGNMENT_API_URL=$VITE_ASSIGNMENT_API_URL \
    VITE_NOTIFICATION_API_URL=$VITE_NOTIFICATION_API_URL \
    VITE_ANALYTICS_API_URL=$VITE_ANALYTICS_API_URL
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://localhost/ || exit 1
