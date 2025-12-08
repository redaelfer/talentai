pipeline {
    agent any

    triggers {
        pollSCM('H/2 * * * *')
    }
    environment {
        TESTCONTAINERS_RYUK_DISABLED = 'true'
        CI = 'true'
        SONAR_HOST_URL = 'http://sonarqube:9000'
        SONAR_TOKEN = credentials('sonar-token')
        DOCKER_USER = 'redaelferr'
    }

    stages {
        stage('1. Checkout') {
            steps {
                checkout scm
            }
        }


        stage('2. Backend - Compile') {
            steps {
                sh 'chmod +x mvnw'
                sh './mvnw clean compile'
            }
        }

        stage('3. Backend - Tests Unitaires') {
            steps {
                sh './mvnw test -Dtestcontainers.ryuk.disabled=true'
            }
        }

        stage('4. Backend - SonarQube') {
            steps {
                script {
                    sh """
                        ./mvnw sonar:sonar \
                        -Dsonar.projectKey=talentai \
                        -Dsonar.host.url=${SONAR_HOST_URL} \
                        -Dsonar.login=${SONAR_TOKEN}
                    """
                }
            }
        }

        stage('5. Backend - Build & Push Docker') {
            steps {
                sh './mvnw package -DskipTests'
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-creds') {
                        def backImage = docker.build("${DOCKER_USER}/talentai-backend:${env.BUILD_NUMBER}")
                        backImage.push()
                        backImage.push("latest")
                    }
                }
            }
        }

        stage('6. Frontend - Install & Test') {
            steps {
                script {
                    docker.image('node:20').inside {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm test -- --watchAll=false'
                        }
                    }
                }
            }
        }

        stage('7. Frontend - Build & Push Docker') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-hub-creds') {
                        dir('frontend') {
                            def frontImage = docker.build("${DOCKER_USER}/talentai-frontend:${env.BUILD_NUMBER}")
                            frontImage.push()
                            frontImage.push("latest")
                        }
                    }
                }
            }
        }

        stage('8. Test de Charge (K6)') {
            steps {
                script {
                    echo 'Lancement du test de charge K6...'
                    sh """
                        cat tests/k6/load-test.js | docker run --rm -i \
                        --network talentai-network \
                        grafana/k6 run -
                    """
                }
            }
        }
    }
}