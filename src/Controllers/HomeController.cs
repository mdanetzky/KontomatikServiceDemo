using System.Collections.Generic;
using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Kontomatik.Controllers
{
    public class HomeController : Controller
    {
        private AppSettings settings;
        public HomeController(IOptions<AppSettings> settings)
        {
            this.settings = settings.Value;
        }
        public IActionResult Index()
        {
            ViewData["Client"] = settings.Client;
            return View();
        }
        public IActionResult Result()
        {
            if (Request.Method == "POST")
            {
                ViewData["SessionId"] = Request.Form["SessionId"];
                ViewData["Target"] = Request.Form["Target"];
                ViewData["ExternalOwnerId"] = Request.Form["ExternalOwnerId"];
            }
            else
            {
                Response.Redirect("/");
            }
            return View();
        }
        public IActionResult ConfigError()
        {
            ViewData["ErrorDescription"] = "";
            ErrorsModel errors = new ErrorsModel();
            if(string.IsNullOrWhiteSpace(settings.ApiKey))
            {
                errors.Errors.Add("The ApiKey is missing");
            }
            if(string.IsNullOrWhiteSpace(settings.Client))
            {
                errors.Errors.Add("The Client is missing");
            }
            if(string.IsNullOrWhiteSpace(settings.ApiUrl))
            {
                errors.Errors.Add("The Api Url is missing");
            }
            ViewData["AppsettingsPath"] = Directory.GetCurrentDirectory() + Path.DirectorySeparatorChar + "appsettings.json";
            return View(errors);
        }
        public IActionResult Error()
        {
            return View();
        }
    }
    public class ErrorsModel {
        public IList<string> Errors = new List<string>();
    }
}
