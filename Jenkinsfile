#!/usr/bin/env groovy

pipeline {
    agent any
 
    environment {
        AWS_REGION          = 'us-east-2'
        ECR_REPO            = '844268948863.dkr.ecr.us-east-2.amazonaws.com'
        IMAGE_NAME          = 'ktn-api'
        KUBECONFIG          = "${HOME}/.kube/config"
        EKS_CLUSTER_NAME    = "korsgy-eks-cluster-68b07"
        CONTEXT_NAME        = "arn:aws:eks:us-west-1:844268948863:cluster/korsgy-eks-cluster-68b07"
        K8S_NAMESPACE       = 'ktn'
        K8S_DEPLOYMENT_NAME = 'ktn-api-deployment'
        ECR_CREDENTIALS     = 'KTN_AWS_CRED'
        EKS_CREDENTIALS     = 'DevOps Credential'  //Used this due to permission issues face using my credentials.
        CONTAINER_NAME      = 'ktn-api-container'
    }


    stages {

        stage('Checkout repository'){
            steps {
                checkout scmGit(branches: [[name: '*/main']], extensions: [], userRemoteConfigs: [[credentialsId: '772d5999-568c-4dce-88e5-daa20d78fa2b', url: 'https://gitlab.com/korsgy-technologies/multimedia/ktn-api.git']])
            }
        }

        stage('Build') {
            steps {
                sh 'npm install'
                sh "docker build -t ${IMAGE_NAME}:${BUILD_NUMBER} ."
                sh "docker tag ${IMAGE_NAME}:${BUILD_NUMBER} ${ECR_REPO}/${IMAGE_NAME}:${BUILD_NUMBER}"
            }
        }

        stage('Push to ECR') {            
            steps {
                   withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'KTN_AWS_CRED',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${ECR_REPO}"
                    sh "docker push ${ECR_REPO}/${IMAGE_NAME}:${BUILD_NUMBER}"
                }
            }
        }

        stage('Deploy to K8s') {
            steps {
                    withCredentials([[
                    $class: 'AmazonWebServicesCredentialsBinding',
                    credentialsId: 'DevOps Credential',
                    accessKeyVariable: 'AWS_ACCESS_KEY_ID',
                    secretKeyVariable: 'AWS_SECRET_ACCESS_KEY'
                ]]) {
                    sh "cat ${KUBECONFIG} > kubeconfig.yaml"
                    sh "kubectl config use-context ${CONTEXT_NAME}"
                    sh "kubectl config use-context ${CONTEXT_NAME} --kubeconfig=kubeconfig.yaml"
                    sh "kubectl set image deployment/${K8S_DEPLOYMENT_NAME} ${CONTAINER_NAME}=${ECR_REPO}/${IMAGE_NAME}:${BUILD_NUMBER} -n ${K8S_NAMESPACE}"
                }
            }

        }

    }
    post {
        always {
            emailext    body: "${currentBuild.currentResult}: ${IMAGE_NAME} build ${BUILD_NUMBER}\n To view the result, plese check the attached console logs output for more info.",
                        to: '$DEFAULT_RECIPIENTS',
                        attachLog: true,
                        subject: "${IMAGE_NAME} - Build # $BUILD_NUMBER - ${currentBuild.currentResult}!"
        }
    }

}
