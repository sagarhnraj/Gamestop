# Stage 1: Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Maven wrapper & pom.xml first for layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copy source code and build production JAR
COPY src/ src/
RUN ./mvnw clean package -DskipTests

# Stage 2: Production runtime stage
FROM eclipse-temurin:21-jre
WORKDIR /app

# Copy compiled JAR artifact from build stage
COPY --from=build /app/target/*.jar app.jar

# Application listens on port 8080 by default (or dynamic $PORT on Render)
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
