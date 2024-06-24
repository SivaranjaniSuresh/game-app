
# game-app

docker-compose build --no-cache --build-arg REACT_APP_API_SERVICE_URL="http://localhost:5004"
docker-compose up

 
730335585832.dkr.ecr.us-west-2.amazonaws.com/twtr-be
730335585832.dkr.ecr.us-west-2.amazonaws.com/twtr-fe

docker build -f be/Dockerfile -t 730335585832.dkr.ecr.us-west-2.amazonaws.com/twtr-be:dev ./be
docker build -f fe/Dockerfile -t 730335585832.dkr.ecr.us-west-2.amazonaws.com/twtr-fe:dev ./fe

aws ecr get-login-password --region us-west-2 \
| docker login --username AWS --password-stdin \
730335585832.dkr.ecr.us-west-2.amazonaws.com

