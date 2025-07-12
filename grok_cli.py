
#!/usr/bin/env python3

import os
import sys
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class GrokCLI:
    def __init__(self):
        self.api_key = os.getenv('GROK_API_KEY') or os.getenv('XAI_API_KEY')
        self.base_url = "https://api.x.ai/v1"
        
        if not self.api_key:
            print("Error: Please set GROK_API_KEY or XAI_API_KEY environment variable")
            sys.exit(1)
    
    def chat_completion(self, message, model="grok-beta"):
        """Send a chat completion request to Grok API"""
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "messages": [
                {"role": "user", "content": message}
            ],
            "model": model,
            "stream": False
        }
        
        try:
            response = requests.post(url, headers=headers, json=data)
            response.raise_for_status()
            
            result = response.json()
            return result['choices'][0]['message']['content']
            
        except requests.exceptions.RequestException as e:
            return f"Error: {e}"
        except KeyError as e:
            return f"Error parsing response: {e}"
    
    def interactive_mode(self):
        """Run interactive chat mode"""
        print("Grok CLI - Interactive Mode")
        print("Type 'exit' or 'quit' to end the session")
        print("-" * 50)
        
        while True:
            try:
                user_input = input("\nYou: ").strip()
                
                if user_input.lower() in ['exit', 'quit', 'q']:
                    print("Goodbye!")
                    break
                
                if not user_input:
                    continue
                
                print("\nGrok: ", end="")
                response = self.chat_completion(user_input)
                print(response)
                
            except KeyboardInterrupt:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"Error: {e}")

def main():
    if len(sys.argv) > 1:
        # Command line mode
        message = " ".join(sys.argv[1:])
        cli = GrokCLI()
        response = cli.chat_completion(message)
        print(response)
    else:
        # Interactive mode
        cli = GrokCLI()
        cli.interactive_mode()

if __name__ == "__main__":
    main()
