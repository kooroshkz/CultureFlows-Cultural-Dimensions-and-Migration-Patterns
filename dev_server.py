#!/usr/bin/env python3
"""
Simple HTTP server for local development - serves from /docs directory
Usage: python3 dev_server.py [port]
"""

import http.server
import socketserver
import os
import sys

def main():
    # Change to docs directory (GitHub Pages source)
    script_dir = os.path.dirname(os.path.abspath(__file__))
    docs_dir = os.path.join(script_dir, 'docs')
    
    if not os.path.exists(docs_dir):
        print("❌ Error: docs directory not found!")
        print(f"   Looking for: {docs_dir}")
        sys.exit(1)
    
    os.chdir(docs_dir)
    
    # Get port from command line or use default
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    
    # Create server
    handler = http.server.SimpleHTTPRequestHandler
    handler.extensions_map.update({
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.csv': 'text/csv',
    })
    
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"🌍 CultureFlows development server")
        print(f"📍 Serving at http://localhost:{port}")
        print(f"📁 Directory: {os.getcwd()}")
        print(f"📄 Source: GitHub Pages (/docs)")
        print(f"⌨️  Press Ctrl+C to stop")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")
            httpd.shutdown()

if __name__ == "__main__":
    main()