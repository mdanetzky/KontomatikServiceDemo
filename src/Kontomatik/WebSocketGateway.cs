using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System.Text.RegularExpressions;

namespace Kontomatik
{
    public class WebSocketGateway
    {
        private KontomatikApi api = null;
        private WebSocket webSocket;
        private IConfigurationSection appsettings;
        public WebSocketGateway(IConfigurationSection appsettings)
        {
            this.appsettings = appsettings;
        }
        public async Task Process(HttpContext context, WebSocket webSocket)
        {
            this.webSocket = webSocket;
            var buffer = new byte[1024 * 4];
            WebSocketReceiveResult result;
            do
            {
                result = await webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), CancellationToken.None);
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string content = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    if (content.Equals("ServerClose"))
                    {
                        await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing from Server", CancellationToken.None);
                        return;
                    }
                    else if (content.Equals("ServerAbort"))
                    {
                        context.Abort();
                    }
                    await HandleKontomatikJson(content);
                }
            } while (!result.CloseStatus.HasValue);
            await webSocket.CloseAsync(result.CloseStatus.Value, result.CloseStatusDescription, CancellationToken.None);
        }
        private async Task HandleKontomatikJson(string json)
        {
            Dictionary<string, string> values = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
            if (values == null)
            {
                this.SendToClient(null, null, "Empty datagram received");
                throw new KontomatikException("WebSocket received an empty datagram");
            }
            if (values.ContainsKey("sessionId") && api == null)
            {
                api = new KontomatikApi(values["sessionId"], appsettings.GetValue<String>("ApiKey"), appsettings.GetValue<String>("ApiUrl"));
            }
            if (values.ContainsKey("id"))
            {
                await runCommand(values, api);
            }
        }
        private async Task runCommand(Dictionary<string, string> commandInfo, KontomatikApi api)
        {
            string Id = commandInfo["id"];
            string apiResponse = "";
            string commandName = GetCommandName(Id);
            try
            {
                switch (commandName)
                {
                    case "ImportOwnerDetails":
                        apiResponse = await api.GetOwnerDetailsXml();
                        break;
                    case "ImportAccounts":
                        apiResponse = await api.GetAccountsXml();
                        break;
                    case "ImportTransactions":
                        apiResponse = await api.GetTransactionsXml(commandInfo["iban"],
                                                Convert.ToDateTime(commandInfo["since"]));
                        break;
                    case "FinHealthIndicator":
                        apiResponse = await api.GetFinHealthIndicatorXml();
                        break;
                    default:
                        this.SendToClient(Id, "", "Unrecognized command: " + Id);
                        break;
                }
                if (!String.IsNullOrEmpty(apiResponse))
                {
                    this.SendToClient(Id, apiResponse, null);
                }
            }
            catch (KontomatikException exception)
            {
                this.SendToClient(Id, "", exception.Message);
            }
        }
        private void SendToClient(string Id, string Data, string Error)
        {
            Datagram payload = new Datagram(Id, Data, Error);
            string json = JsonConvert.SerializeObject(payload);
            var encodedJson = Encoding.UTF8.GetBytes(json);
            var buffer = new ArraySegment<Byte>(encodedJson);
            webSocket.SendAsync(buffer, WebSocketMessageType.Text, true, CancellationToken.None);
        }
        private static string GetCommandName(string id)
        {
            if (id != null && id.Contains("Command"))
            {
                return Regex.Split(id, "Command")[0];
            }
            return null;
        }
    }
    public class Datagram
    {
        public Datagram(string Id, string Data, string Error)
        {
            this.Id = Id;
            this.Data = Data;
            this.Error = Error;
        }
        public string Id { get; set; }
        public string Data { get; set; }
        public string Error { get; set; }
    }
}