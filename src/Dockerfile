FROM microsoft/dotnet:1.1.0-runtime

WORKDIR /app

COPY out .

EXPOSE 5000/tcp

ENTRYPOINT ["dotnet", "src.dll", "--server.urls", "http://*:5000"]
