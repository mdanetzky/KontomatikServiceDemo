using Xunit;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Kontomatik
{
    public class ApiTests
    {
        static readonly AppSettings appSettings = Settings.LoadTestSettings();
        [Fact]
        public void testSettingsAreOk()
        {
            Assert.False(String.IsNullOrWhiteSpace(appSettings.ApiKey), "ApiKey is missing in testsettings.json");
            Assert.False(String.IsNullOrWhiteSpace(appSettings.Client), "Client is missing in testsettings.json");
            Assert.False(String.IsNullOrWhiteSpace(appSettings.ApiUrl), "ApiUrl is missing in testsettings.json");
        }
        [Fact]
        public async void LogsInWithMockCredentials()
        {
            KontomatikApi api = await LoginWithMockCredentials();
            Assert.NotNull(api);
        }
        [Fact]
        public async void RetrievesOwnerData()
        {
            KontomatikApi api = await LoginWithMockCredentials();
            string owner = await api.GetOwnerDetailsXml();
            Assert.Contains("<name>Jan Kowalski</name>", owner);
        }
        [Fact]
        public async void RetrievesAccounts()
        {
            KontomatikApi api = await LoginWithMockCredentials();
            string accounts = await api.GetAccountsXml();
            Assert.Contains("<iban>PL05114020170000400213015148</iban>", accounts);
        }
        [Fact]
        public async void RetrievesTransactions()
        {
            KontomatikApi api = await LoginWithMockCredentials();
            string transactions = await api.GetTransactionsXml("PL05114020170000400213015148", new DateTime(2000, 1, 1));
            Assert.Contains("<kind>PRZELEW ZEWNĘTRZNY</kind>", transactions);
        }
        [Fact]
        public async void RetrievesFinHealthIndicator()
        {
            KontomatikApi api = await LoginWithMockCredentials();
            string finHealtIndicator = await api.GetFinHealthIndicatorXml();
            Assert.Contains("<reply", finHealtIndicator);
        }
        [Fact]
        public void FailsOnNulls()
        {
            Exception ex = Assert.Throws<NullReferenceException>(() => new KontomatikApi(null, null, null));
        }
        [Fact]
        public void FailsOnEmptySessionId()
        {
            KontomatikException ex = Assert.Throws<KontomatikException>(() => new KontomatikApi("", "", ""));
            Assert.Equal(" is missing the sessionIdSignature after colon", ex.Message);
        }
        [Fact]
        public void FailsOnMalformedSessionId()
        {
            KontomatikException ex = Assert.Throws<KontomatikException>(() => new KontomatikApi("malformedSessionId", "", ""));
            Assert.Equal("malformedSessionId is missing the sessionIdSignature after colon", ex.Message);
        }
        private void WaitForEvent(Action<ManualResetEvent> action)
        {
            using (ManualResetEvent finished = new ManualResetEvent(false))
            {
                action(finished);
                finished.WaitOne();
            }
        }
        private async Task<KontomatikApi> LoginWithMockCredentials()
        {
            KontomatikApi api = new KontomatikApi(appSettings.ApiKey, appSettings.ApiUrl);
            Queue<KontomatikCredential> credentials = new Queue<KontomatikCredential>();
            credentials.Enqueue(new KontomatikCredential("STATIC_LOGIN", "test"));
            credentials.Enqueue(new KontomatikCredential("STATIC_PASSWORD", "Test123"));
            string loginResult = await api.EnterCredentials("Mbank", credentials);
            return api;
        }
        private static void assertNoError(string error)
        {
            if (error != null)
            {
                Assert.True(false, error);
            }
        }
    }
}