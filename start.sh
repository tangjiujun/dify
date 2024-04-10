docker build -t dify-demo:latest .
docker rm -f dify-demo
docker run -d --name dify-demo -p 3000:3000 dify-demo:latest
