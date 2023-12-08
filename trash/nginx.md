## Installing Nginx

`sudo apt update`
`sudo apt install nginx`

### Configuration

`/etc/nginx/sites-available/default`

```
server { 
    listen 4000; 
    server_name zerofourtwo.net;
    location / {
        proxy_pass http://localhost:4004;
    }
    location /api {
        proxy_pass http://localhost:3000;
    }
    location /api {
        proxy_pass http://localhost:8000;
    }
}
```