docker build -t dify-demo:latest .
docker rm -f dify-demo
docker run -d --name dify-demo -p 3000:3000 dify-demo:latest

# docker run -d --name nginx -p 443:443 -v /root/nginx/conf:/etc/nginx/conf.d -v /root/nginx/ssl:/etc/nginx/ssl nginx
