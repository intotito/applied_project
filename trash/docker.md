# Docker Installation

## Development Machine

- Check the Linux Version: go to the root  `cat /etc/issue`
- Update the apt package index: `sudo apt-get update`
- Install apt-transport-https: `apt-get install apt-transport-https ca-certificates curl gnupg lsb-release`
- Add Docker's official GPG key: ```sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg', sudo chmod a+r /etc/apt/keyrings/docker.gpg ```
- Set up repository: ```
  echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null ```
- Install Docker engine: ```sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker- compose-plugin```
- Create docker group and and your user: ```sudo groupadd docker, sudo usermod -aG docker $USER```
## Production Machine Daemon Installation

`sudo apt-get update`
`sudo apt-get install docker.io -y`
`sudo systemctl start docker`

### Saving Docker Image

`docker save -o <generated tar file name> <docker-name>`

### Running docker Image
`docker run -p <image-port>:<host-port> <docker-image>`

### Transferring docker Image

`scp controller-box.tar.gz ubuntu@100.25.29.105:/home/ubuntu/docker-repos`