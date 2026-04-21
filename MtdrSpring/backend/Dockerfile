FROM openjdk:22-jdk
#COPY pom.xml /tmp/
#COPY src /tmp/src/
RUN mkdir -p /mtdrworkshop/creds
COPY wallet/ /mtdrworkshop/creds
WORKDIR /tmp/
EXPOSE 8080
COPY target/MyTodoList-0.0.1-SNAPSHOT.jar MyTodoList.jar

ARG UI_USERNAME
ARG UI_PASSWORD
ARG DB_USER
ARG DBPASSWORD
ARG DB_URL
ARG DRIVER_CLASS_NAME

ARG DEEPSEEK_API_KEY
ARG TELEGRAM_BOT_TOKEN
ARG TELEGRAM_BOT_NAME

ENV ui_username=${UI_USERNAME}
ENV ui_password=${UI_PASSWORD}
ENV db_user=${DB_USER}
ENV dbpassword=${DBPASSWORD}
ENV db_url=${DB_URL}
ENV driver_class_name=${DRIVER_CLASS_NAME}

ENV deepseek_api_key=${DEEPSEEK_API_KEY}
ENV telegram_bot_token=${TELEGRAM_BOT_TOKEN}
ENV telegram_bot_name=${TELEGRAM_BOT_NAME}

ENTRYPOINT ["java","-jar","MyTodoList.jar"]
