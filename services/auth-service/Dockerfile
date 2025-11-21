FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre
COPY --from=build /app/target/auth-service-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java","-jar","/app.jar"]
