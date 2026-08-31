pipeline {
  agent any

  options {
    disableConcurrentBuilds()
    skipDefaultCheckout(true)
    timestamps()
  }

  parameters {
    booleanParam(name: 'RUN_COMPOSE_VALIDATION', defaultValue: false, description: 'Build and start an isolated Compose stack after component validation')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          env.GIT_SHA = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
        }
      }
    }

    stage('Environment Verification') {
      steps {
        sh 'git --version'
        sh 'docker --version'
        sh 'docker info --format "{{.ServerVersion}}"'
        sh 'docker compose version'
      }
    }

    stage('Prepare Prisma Engines') {
      agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
      steps {
        dir('services/auth-service') {
          sh 'npm ci --ignore-scripts'
          retry(3) {
            sh 'npx prisma generate'
          }
          sh '''mkdir -p ../../.ci/prisma-engines
            cp node_modules/prisma/schema-engine-linux-musl-openssl-3.0.x ../../.ci/prisma-engines/
            cp node_modules/prisma/libquery_engine-linux-musl-openssl-3.0.x.so.node ../../.ci/prisma-engines/
            test -x ../../.ci/prisma-engines/schema-engine-linux-musl-openssl-3.0.x
            test -f ../../.ci/prisma-engines/libquery_engine-linux-musl-openssl-3.0.x.so.node'''
        }
      }
    }

    stage('Package Prisma Engines') {
      steps {
        sh 'docker build -f "${WORKSPACE}/ci/prisma-engines.Dockerfile" -t fixguard-prisma-engines:6.19.0 .ci/prisma-engines'
      }
    }

    stage('Parallel Component Validation') {
      environment {
        PRISMA_SCHEMA_ENGINE_BINARY = '../../.ci/prisma-engines/schema-engine-linux-musl-openssl-3.0.x'
        PRISMA_QUERY_ENGINE_LIBRARY = '../../.ci/prisma-engines/libquery_engine-linux-musl-openssl-3.0.x.so.node'
      }
      parallel {
        stage('Auth') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/auth-service') { sh 'npm ci'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Report') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/report-service') { sh 'npm ci'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Location') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/location-service') { sh 'npm ci'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Assignment') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/assignment-service') { sh 'npm ci'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Notification') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/notification-service') { sh 'npm ci'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Analytics') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/analytics-service') { sh 'npm ci'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Frontend') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('frontend') { sh 'npm ci && npm test && npm run build' } }
        }
      }
    }

    stage('Compose Build and Integration Health') {
      when { expression { params.RUN_COMPOSE_VALIDATION } }
      steps {
        sh '''set +x
          umask 077
          ci_random() { od -An -N24 -tx1 /dev/urandom | tr -d ' \n'; }
          {
            echo "CI_COMPOSE_PROJECT=fixguard-ci-${BUILD_NUMBER}"
            echo 'POSTGRES_USER=fixguard_ci'
            echo "POSTGRES_PASSWORD=$(ci_random)"
            echo 'POSTGRES_DB=fixguard_auth_ci'
            echo 'REPORT_DB=fixguard_report_ci'
            echo 'LOCATION_DB=fixguard_location_ci'
            echo 'ASSIGNMENT_DB=fixguard_assignment_ci'
            echo 'NOTIFICATION_DB=fixguard_notification_ci'
            echo 'ANALYTICS_DB=fixguard_analytics_ci'
            echo 'RABBITMQ_USER=fixguard_ci'
            echo "RABBITMQ_PASSWORD=$(ci_random)"
            echo "JWT_SECRET=$(ci_random)"
            echo "INTERNAL_SERVICE_KEY=$(ci_random)"
            echo 'ADMIN_USERNAME=fixguard_ci_admin'
            echo 'ADMIN_EMAIL=fixguard-ci@example.invalid'
            echo "ADMIN_PASSWORD=$(ci_random)"
          } > .ci/compose.env'''
        sh 'docker compose --env-file .ci/compose.env -f docker-compose.yml -f ci/docker-compose.ci.yml -p "fixguard-ci-${BUILD_NUMBER}" config --quiet'
        sh 'docker compose --env-file .ci/compose.env -f docker-compose.yml -f ci/docker-compose.ci.yml -p "fixguard-ci-${BUILD_NUMBER}" build'
        sh 'docker compose --env-file .ci/compose.env -f docker-compose.yml -f ci/docker-compose.ci.yml -p "fixguard-ci-${BUILD_NUMBER}" up -d --wait'
        sh 'docker compose --env-file .ci/compose.env -f docker-compose.yml -f ci/docker-compose.ci.yml -p "fixguard-ci-${BUILD_NUMBER}" ps'
      }
      post {
        unsuccessful {
          sh '''compose_ci() {
              docker compose --env-file .ci/compose.env -f docker-compose.yml -f ci/docker-compose.ci.yml -p "fixguard-ci-${BUILD_NUMBER}" "$@"
            }
            compose_ci ps -a || true
            compose_ci logs --no-color --tail=200 postgres rabbitmq || true
            compose_ci logs --no-color --tail=200 report-db-init location-db-init assignment-db-init notification-db-init analytics-db-init || true
            compose_ci logs --no-color --tail=200 auth-service report-service location-service assignment-service notification-service analytics-service || true
            postgres_id="$(compose_ci ps -q postgres 2>/dev/null || true)"
            rabbitmq_id="$(compose_ci ps -q rabbitmq 2>/dev/null || true)"
            if [ -n "$postgres_id" ]; then
              docker inspect --format 'postgres status={{.State.Status}} exit={{.State.ExitCode}} error={{json .State.Error}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$postgres_id" || true
            fi
            if [ -n "$rabbitmq_id" ]; then
              docker inspect --format 'rabbitmq status={{.State.Status}} exit={{.State.ExitCode}} error={{json .State.Error}} health={{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$rabbitmq_id" || true
            fi'''
        }
        always {
          sh '''docker compose --env-file .ci/compose.env -f docker-compose.yml -f ci/docker-compose.ci.yml -p "fixguard-ci-${BUILD_NUMBER}" down --volumes --remove-orphans || true
            rm -f .ci/compose.env'''
        }
      }
    }
  }

  post {
    success {
      echo "FixGuard full validation passed for ${env.GIT_SHA}."
    }
    failure {
      echo 'Full validation failed; inspect the failed stage and its diagnostics.'
    }
    always {
      deleteDir()
    }
  }
}
