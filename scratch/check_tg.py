import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

url = 'https://t.me/s/USMLEBoardsAndBeyondVideos'
r = requests.get(url, headers=headers)
soup = BeautifulSoup(r.text, 'html.parser')

body_text = soup.body.text if soup.body else "No body"
print("HTML Body Text (First 1000 chars):")
print(body_text[:1000])
