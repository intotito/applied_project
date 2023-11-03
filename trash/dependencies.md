# PM2 - Daemonize your App
An application that restarts a node application when the server crashes or starts.
`sudo npm install pm2@latest -g`
`pm2 start index.js`

# Nginx Web Server

Nginx would be used to redirect traffic to the desired endpoint. Endpoints will be generally divided into two: 
- API end point
- Angular endpoint

`sudo apt-get install nginx`
`systemctl status nginx` to make sure it is actually running after installation

## Nginx Configuration file in /etc/nginx/sites-available
server {
        listen 4000;

        server_name zerofourtwo.net;

        location / {
                proxy_pass http://localhost:4004;
        }
}