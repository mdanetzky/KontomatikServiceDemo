# Kontomatik Api Demo (.Net Core) 1.0.0

This is a sample implementation of [Kontomatik Api](http://developer.kontomatik.com/api-doc/) written in C# and Typescript.

## Prerequisites

* [DotNet Core](https://www.microsoft.com/net/core)
* [Typescript](https://www.typescriptlang.org/)
* [Kontomatik Api key](http://kontomatik.com/)
* Optionally [Visual Studio Code](http://code.visualstudio.com)

## Obtaining the api-key

Go to the [kontomatik.com](http://kontomatik.com/), scroll down and click on "Request a demo for your bank".
Once you have the key and client name, set the ApiKey and Client in src/appsettings.json.
The ApiUrl in src/appsettings.json should either point to https://test.api.kontomatik.com/ or to https://api.kontomatik.com/ depending on the type of licence provided with the api key.

## Running the program

* In the shell cd to project's src folder and type:
```
dotnet restore
dotnet run
```
* Open the browser and navigate to [http://localhost:5000](http://localhost:5000)
