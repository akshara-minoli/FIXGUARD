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
          sh 'npm ci'
          retry(3) {
            sh 'npx prisma generate'
          }
          sh '''mkdir -p ../../.ci/prisma-engines
            cp -R node_modules/@prisma/engines/. ../../.ci/prisma-engines/
            test -f ../../.ci/prisma-engines/schema-engine-linux-musl-openssl-3.0.x
            test -f ../../.ci/prisma-engines/libquery_engine-linux-musl-openssl-3.0.x.so.node'''
        }
      }
    }

    stage('Parallel Component Validation') {
      parallel {
        stage('Auth') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/auth-service') { sh 'npm ci'; sh 'cp -R ../../.ci/prisma-engines/. node_modules/@prisma/engines/'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Report') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/report-service') { sh 'npm ci'; sh 'cp -R ../../.ci/prisma-engines/. node_modules/@prisma/engines/'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Location') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/location-service') { sh 'npm ci'; sh 'cp -R ../../.ci/prisma-engines/. node_modules/@prisma/engines/'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Assignment') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/assignment-service') { sh 'npm ci'; sh 'cp -R ../../.ci/prisma-engines/. node_modules/@prisma/engines/'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Notification') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/notification-service') { sh 'npm ci'; sh 'cp -R ../../.ci/prisma-engines/. node_modules/@prisma/engines/'; sh 'npx prisma generate'; sh 'npm test' } }
        }
        stage('Analytics') {
          agent { docker { image 'node:22-alpine'; reuseNode true; args '-u root:root' } }
          steps { dir('services/analytics-service') { sh 'npm ci'; sh 'cp -R ../../.ci/prisma-engines/. node_modules/@prisma/engines/'; sh 'npx prisma generate'; sh 'npm test' } }
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
        sh 'docker compose -p "fixguard-ci-${BUILD_NUMBER}" build'
        sh 'docker compose -p "fixguard-ci-${BUILD_NUMBER}" up -d --wait'
        sh 'docker compose -p "fixguard-ci-${BUILD_NUMBER}" ps'
      }
      post {
        always {
          sh 'docker compose -p "fixguard-ci-${BUILD_NUMBER}" down --remove-orphans || true'
        }
      }
    }
  }

  post {
    success {
      echo "FixGuard full validation passed for ${env.GIT_SHA}."
    }
    failure {
      echo 'Full validation failed; inspect the failed parallel branch.'
    }
    always {
      deleteDir()
    }
  }
}
