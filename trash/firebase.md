## Firebase

### Install Firebase Tools
`npm install -g firebase-tools`

### Login to Firebase

`npm firebase login`

### Possible Error Fix

`Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUse`

### Initialize Firebase

`firebase init`

### Install Firebase Admin Tools

`npm install firebase-admin --save`

### Install Client Library

`npm install @google-cloud/firestore`

### Install Google Cloud CLI
#### Windows (In Powershell)

```
(New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")

& $env:Temp\GoogleCloudSDKInstaller.exe
```

#### Linux (Terminal)

```
curl -O https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-cli-456.0.0-linux-x86_64.tar.gz

tar -xf google-cloud-cli-456.0.0-linux-x86_64.tar.gz

./google-cloud-sdk/install.sh

./google-cloud-sdk/bin/gcloud init
```

### Environment Setup

`npm install dotenv`

### Setup Application Default Credentials (ADC)

`gcloud auth application-default login`