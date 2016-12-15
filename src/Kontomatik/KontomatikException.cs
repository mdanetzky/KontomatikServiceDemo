using System;

namespace Kontomatik
{
    public class KontomatikException : Exception
    {
        public KontomatikException() { }
        public KontomatikException( string message ) : base( message ) { }
        public KontomatikException( string message, Exception inner ) : base( message, inner ) { }
    }
}