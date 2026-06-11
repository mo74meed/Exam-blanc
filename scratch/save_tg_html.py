import requests

headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
}

url = 'https://t.me/s/USMLEBoardsAndBeyondVideos'
r = requests.get(url, headers=headers)
with open('scratch/tg_page.html', 'w', encoding='utf-8') as f:
    f.write(r.text)
print("Saved HTML to scratch/tg_page.html")
print("HTML length:", len(r.text))
