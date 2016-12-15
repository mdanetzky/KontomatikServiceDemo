using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;

namespace Kontomatik
{
    public class ConfigCheckMiddleware
    {
        private bool configOk;
        private readonly RequestDelegate next;
        private readonly string errorPath;
        public ConfigCheckMiddleware(RequestDelegate next, string errorPath, IConfigurationSection apiConfig)
        {
            this.next = next;
            this.errorPath = errorPath;
            this.configOk = CheckConfig(apiConfig);
        }
        public async Task Invoke(HttpContext context)  {
            if(!configOk) 
            {
                context.Request.Path = errorPath;
            }
            await next.Invoke(context);
        }
        private static bool CheckConfig(IConfigurationSection apiConfig)
        {
            return IsDefinedInConfig("ApiKey", apiConfig) &&
                IsDefinedInConfig("Client", apiConfig) &&
                IsDefinedInConfig("ApiUrl", apiConfig);
        }
        private static bool IsDefinedInConfig(string keyName, IConfigurationSection apiConfig)
        {
            return !string.IsNullOrWhiteSpace(apiConfig.GetValue<string>(keyName));
        }
    }
}