FROM node:20-alpine 
WORKDIR /app
COPY . .
RUN ln -s /app/gen /gen && chmod +x /gen
ENV TESTROBOTSTRPATH=/app
ENTRYPOINT ["sh", "-c" , "while true; do sleep 1000; done"]