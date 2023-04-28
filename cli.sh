command=$1

if [ "$command" = "package" ]; then
  docker build -t snoxe/waterpipe_admin:latest .
fi

if [ "$command" = "run" ]; then
  ./cli.sh package
  docker run -p 8080:8080 snoxe/waterpipe_admin
fi

if [ "$command" = "publish" ]; then
    ./cli.sh package
    docker push snoxe/waterpipe_admin:latest
fi