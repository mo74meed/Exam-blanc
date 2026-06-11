import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

for channel in ['USMLEBoardsAndBeyondVideos', 'BoardsAndBeyondVideos']:
    url = f'https://t.me/s/{channel}'
    r = requests.get(url, headers=headers)
    soup = BeautifulSoup(r.text, 'html.parser')
    messages = soup.find_all('div', class_='tgme_widget_message_wrap')
    title = soup.find('title')
    title_text = title.text.strip() if title else "No title"
    print(f"\nChannel: {channel}")
    print(f"  URL: {url}")
    print(f"  Title: {title_text}")
    print(f"  Messages found: {len(messages)}")
