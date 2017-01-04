using System;
using System.Linq;
using System.Threading.Tasks;
using System.Xml.Linq;
using System.Net.Http;
using System.Collections.Generic;

namespace Kontomatik
{
    public class KontomatikApi
    {
        private string ApiKey;
        private string ApiUrl;
        private string[] SessionId;
        private string ExternalOwnerId;
        private string Target;
        public KontomatikApi(string ApiKey, string ApiUrl)
        {
            this.ApiKey = ApiKey;
            this.ApiUrl = ApiUrl;
            this.ExternalOwnerId = RandomString(20);
        }
        public KontomatikApi(string SessionId, string ExternalOwnerId, string ApiKey, string ApiUrl)
        {
            if (!SessionId.Contains(":"))
            {
                throw new KontomatikException(SessionId + " is missing the sessionIdSignature after colon");
            }
            this.SessionId = SessionId.Split(':');
            this.ExternalOwnerId = ExternalOwnerId;
            this.ApiKey = ApiKey;
            this.ApiUrl = ApiUrl;
        }
        public async Task<string> EnterCredentials(String target, Queue<KontomatikCredential> credentials)
        {
            this.Target = target;
            this.SessionId = await FetchSessionId();
            return await EnterCredential(credentials);
        }
        private async Task<string> EnterCredential(Queue<KontomatikCredential> credentials)
        {
            KontomatikCredential credential = credentials.Dequeue();
            Dictionary<string, string> enterCredentialsForm = GetBaseApiForm();
            enterCredentialsForm.Add("credentialKind", credential.kind);
            enterCredentialsForm.Add("credential", credential.credential);
            string response = await RunApiCommand(GetApiUrl() + "/v1/command/enter-credential.xml", enterCredentialsForm);
            if (response.Contains("<credentialsMetadata>"))
            {
                return await EnterCredential(credentials);
            }
            else
            {
                return "Success";
            }
        }
        private async Task<string[]> FetchSessionId()
        {
            Dictionary<string, string> formData = new Dictionary<string, string>
            {
                { "apiKey", ApiKey },
                { "target", Target },
                { "ip", "127.0.0.1" },
                { "sessionIdSignatureRequired", "true" }
            };
            String sessionResponse = await PerformPostRequest(GetApiUrl() + "/v1/session.xml", formData);
            XElement sessionXml = XElement.Parse(sessionResponse);
            XElement sessionElement = sessionXml.Element("session");
            return new string[] {
                sessionElement.Attribute("id").Value,
                sessionElement.Attribute("signature").Value
            };
        }
        public async Task<string> GetAccountsXml()
        {
            CheckSession();
            var values = GetBaseApiForm();
            return await RunApiCommand(GetApiUrl() + "/v1/command/import-accounts.xml", values);
        }
        public async Task<string> GetTransactionsXml(string iban, DateTime since)
        {
            CheckSession();
            var values = GetBaseApiForm();
            values.Add("iban", iban);
            values.Add("since", since.ToString("yyyy-MM-dd"));
            return await RunApiCommand(GetApiUrl() + "/v1/command/import-account-transactions.xml", values);
        }
        public async Task<string> GetOwnerDetailsXml()
        {
            CheckSession();
            var values = GetBaseApiForm();
            return await RunApiCommand(GetApiUrl() + "/v1/command/import-owners.xml", values);
        }
        public async Task<string> GetFinHealthIndicatorXml()
        {
            CheckSession();
            var values = GetBaseApiForm();
            return await PerformGetRequest(GetApiUrl() + "/v1/indicator.xml", values);
        }
        private async Task<String> RunApiCommand(string commandUrl, Dictionary<string, string> commandFormValues)
        {
            string commandResponse = await PerformPostRequest(commandUrl, commandFormValues);
            XElement commandXml = XElement.Parse(commandResponse);
            CheckResponse(commandXml);
            string commandId = commandXml.Element("command").Attribute("id").Value;
            while (!CommandHasFinished(commandXml))
            {
                await Task.Delay(500);
                commandXml = await GetCommandStatus(commandId);
            }
            return GetResult(commandXml);
        }
        private async Task<XElement> GetCommandStatus(string commandId)
        {
            var values = GetBaseApiForm();
            string commandStatusUrl = GetApiUrl() + "/v1/command/" + commandId + ".xml";
            string response = await PerformGetRequest(commandStatusUrl, values);
            XElement commandXml = XElement.Parse(response);
            CheckResponse(commandXml);
            return commandXml;
        }
        private string GetResult(XElement commandXml)
        {
            XElement commandElement = commandXml.Element("command");
            if (commandElement.Elements("result").Any())
            {
                return commandElement.Element("result").ToString();
            }
            else
            {
                return "Success";
            }
        }
        private bool CommandHasFinished(XElement commandXml)
        {
            string status = GetStatus(commandXml);
            return !status.Equals("in_progress", StringComparison.OrdinalIgnoreCase);
        }
        private static string GetStatus(XElement commandXml)
        {
            XElement commandElement = commandXml.Element("command");
            return commandElement.Attribute("state").Value;
        }
        private static void CheckResponse(XElement commandXml)
        {
            if (commandXml.Elements("exception").Any())
            {
                string exceptionMessage = (commandXml.Element("exception").Element("message").FirstNode as XText).Value;
                throw new KontomatikException(exceptionMessage);
            }
            if (!commandXml.Elements("command").Any())
            {
                throw new KontomatikException("Bad Response: " + commandXml.ToString());
            }
        }
        private static bool CheckAndHandleResponse(string response, Action<String, String> callback)
        {
            if (String.IsNullOrWhiteSpace(response))
            {
                throw new KontomatikException("Response from API is empty");
            }
            if (!response.Contains("<reply"))
            {
                throw new KontomatikException("Malformed response from API: " + response);
            }
            if (response.Contains("<exception"))
            {
                XElement exceptionMessageXml = XElement.Parse(response);
                throw new KontomatikException(exceptionMessageXml.Element("exception").ToString());
            }
            return true;
        }
        private Dictionary<string, string> GetBaseApiForm()
        {
            return new Dictionary<string, string>
                {
                    { "apiKey", ApiKey },
                    { "sessionId", SessionId[0] },
                    { "sessionIdSignature", SessionId[1] },
                    { "externalOwnerId", ExternalOwnerId }
                };
        }
        private static async Task<string> PerformPostRequest(string url, Dictionary<string, string> values)
        {
            return await GetResponse((HttpClient client) =>
            {
                var form = new FormUrlEncodedContent(values);
                return client.PostAsync(url, form);
            });
        }
        private static async Task<string> PerformGetRequest(string url, Dictionary<string, string> values)
        {
            return await GetResponse((HttpClient client) =>
            {
                return client.GetAsync(CombineUrlAndParameters(url, values));
            });
        }
        private static async Task<string> GetResponse(Func<HttpClient, Task<HttpResponseMessage>> performRequest)
        {
            HttpClient client = new HttpClient();
            try
            {
                HttpResponseMessage response = await performRequest(client);
                string resp = await response.Content.ReadAsStringAsync();
                return resp;
            }
            catch (Exception exception)
            {
                throw new KontomatikException(exception.ToString());
            }
            finally
            {
                client.Dispose();
            }
        }
        private void CheckSession()
        {
            if (SessionId == null)
            {
                throw new KontomatikException("Missing session id. Please log in to the bank first.");
            }
        }
        private static string CombineUrlAndParameters(string url, Dictionary<string, string> parameters)
        {
            var list = new List<string>();
            foreach (var item in parameters)
            {
                list.Add(item.Key + "=" + item.Value);
            }
            return string.Format(url + "?{0}", string.Join("&", list));
        }
        private string GetApiUrl()
        {
            if (this.ApiUrl.EndsWith("/"))
            {
                return this.ApiUrl.Remove(this.ApiUrl.Length - 1);
            }
            return this.ApiUrl;
        }
        public static string RandomString(int length)
        {
            Random random = new Random();
            const string chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            return new string(Enumerable.Repeat(chars, length)
              .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }

    public class KontomatikCredential
    {
        public string kind { get; }
        public string credential { get; }
        public KontomatikCredential(string kind, string credential)
        {
            this.kind = kind;
            this.credential = credential;
        }
    }
}