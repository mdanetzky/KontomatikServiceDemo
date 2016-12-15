using System.IO;
using Microsoft.Extensions.Configuration;

namespace Kontomatik
{
    public class Settings
    {
        public static IConfigurationRoot Configuration;
        public static AppSettings LoadTestSettings()
        {
            var builder =
                new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("testsettings.json");
            Configuration = builder.Build();
            AppSettings Settings = new AppSettings();
            Configuration.GetSection("ApplicationSettings").Bind(Settings);
            return Settings;
        }
    }
}