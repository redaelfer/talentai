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
    }

    stages {
        stage('1. Checkout') {
            steps {
                checkout scm
            }
        }

        stage('2. Compiler') {
            steps {
                sh 'chmod +x mvnw'
                sh './mvnw clean compile'
            }
        }

        stage('3. Tests Unitaires') {
            steps {
                sh './mvnw test -Dtestcontainers.ryuk.disabled=true'
            }
        }

        stage('4. Package') {
            steps {
                sh './mvnw package -DskipTests'
            }
        }

        stage('5. SonarQube Analysis') {
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
    }
}