import os
from google_auth_oauthlib.flow import InstalledAppFlow

# The scope required to read Google Analytics Data
SCOPES = ['https://www.googleapis.com/auth/analytics.readonly']

def main():
    # Get the absolute paths for the root directory files
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    client_secrets_file = os.path.join(root_dir, 'client_secret.json')
    token_file = os.path.join(root_dir, 'token.json')

    print(f"Looking for client secret at: {client_secrets_file}")
    
    if not os.path.exists(client_secrets_file):
        print("ERROR: client_secret.json not found! Please make sure it's in the root folder.")
        return

    # Create the flow using the downloaded JSON file
    flow = InstalledAppFlow.from_client_secrets_file(client_secrets_file, SCOPES)
    
    # Run the local server to handle the browser login popup
    print("\nAttempting to open your browser...")
    print("Please log in with the Gmail account that has access to Google Analytics.")
    creds = flow.run_local_server(port=0)

    # Save the resulting credentials (Refresh Token) for our backend/MCP Server
    with open(token_file, 'w') as token:
        token.write(creds.to_json())

    print("\nSUCCESS! token.json has been generated in the root directory.")
    print("The OAuth Bypass is complete. You will not need to run this script again.")

if __name__ == '__main__':
    main()
