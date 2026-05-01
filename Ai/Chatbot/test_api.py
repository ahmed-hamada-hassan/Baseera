import requests
import json

url = "http://localhost:8000/api/chatbot/message"
headers = {
    "Authorization": "Bearer my-test-token"
}
payload = {
    "message": "what can i do to save money more?"
}

print("Sending request to Baseera...")
response = requests.post(url, headers=headers, json=payload)

# Print the beautiful JSON response
print(f"Status Code: {response.status_code}")
print(json.dumps(response.json(), indent=2))