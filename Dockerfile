FROM node:18

COPY . /app/public

RUN npm install http-server -g

EXPOSE 8080
CMD ["http-server", "--no-dotfiles", "/app/public"]