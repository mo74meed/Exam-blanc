# Boards & Beyond Telegram Video Downloader & Sorter
# Requires Telethon: pip install telethon

import os
import sys
import re
import asyncio

try:
    from telethon import TelegramClient
    from telethon.tl.types import MessageMediaDocument
except ImportError:
    print("Error: Telethon library is not installed.")
    print("Please install it by running: pip install telethon")
    sys.exit(1)

# --- CURRICULUM DATABASE MAPPING ---
VIDEO_DATABASE = [
    # Cardiology
    {"id": "cardio_phys_1", "title": "Cardiac Action Potentials", "subject": "cardiology"},
    {"id": "cardio_phys_2", "title": "EKG Basics", "subject": "cardiology"},
    {"id": "cardio_phys_3", "title": "Cardiac Cycle", "subject": "cardiology"},
    {"id": "cardio_phys_4", "title": "Pressure-Volume Loops", "subject": "cardiology"},
    {"id": "cardio_phys_5", "title": "Cardiac Output", "subject": "cardiology"},
    {"id": "cardio_phys_6", "title": "Hemodynamics & Baroreceptors", "subject": "cardiology"},
    {"id": "cardio_path_1", "title": "Heart Failure", "subject": "cardiology"},
    {"id": "cardio_path_2", "title": "Ischemic Heart Disease", "subject": "cardiology"},
    {"id": "cardio_path_3", "title": "Myocardial Infarction", "subject": "cardiology"},
    {"id": "cardio_path_4", "title": "Valvular Disease", "subject": "cardiology"},
    {"id": "cardio_path_5", "title": "Cardiomyopathies", "subject": "cardiology"},
    {"id": "cardio_path_6", "title": "Arrhythmias Basics", "subject": "cardiology"},
    {"id": "cardio_pharma_1", "title": "Antihypertensive Drugs", "subject": "cardiology"},
    {"id": "cardio_pharma_2", "title": "Antiarrhythmic Drugs", "subject": "cardiology"},
    {"id": "cardio_pharma_3", "title": "Heart Failure Drugs", "subject": "cardiology"},

    # Gastroenterology
    {"id": "gi_phys_1", "title": "Gastrointestinal Anatomy", "subject": "gastroenterology"},
    {"id": "gi_phys_2", "title": "Gastric Secretions", "subject": "gastroenterology"},
    {"id": "gi_phys_3", "title": "Pancreatic Enzymes", "subject": "gastroenterology"},
    {"id": "gi_phys_4", "title": "Bilirubin Metabolism", "subject": "gastroenterology"},
    {"id": "gi_path_1", "title": "Esophageal Disease", "subject": "gastroenterology"},
    {"id": "gi_path_2", "title": "Gastric Disorders", "subject": "gastroenterology"},
    {"id": "gi_path_3", "title": "Inflammatory Bowel Disease", "subject": "gastroenterology"},
    {"id": "gi_path_4", "title": "Liver Cirrhosis", "subject": "gastroenterology"},
    {"id": "gi_path_5", "title": "Hepatitis Viruses", "subject": "gastroenterology"},
    {"id": "gi_path_6", "title": "Pancreatitis & Biliary Disease", "subject": "gastroenterology"},
    {"id": "gi_path_7", "title": "Diarrhea & Malabsorption", "subject": "gastroenterology"},
    {"id": "gi_pharma_1", "title": "Acid Suppressive Drugs", "subject": "gastroenterology"},
    {"id": "gi_pharma_2", "title": "Antiemetic & Laxatives", "subject": "gastroenterology"},

    # Pulmonary
    {"id": "pulm_phys_1", "title": "Lung Anatomy & Mechanics", "subject": "pulmonary"},
    {"id": "pulm_phys_2", "title": "Ventilation & Perfusion", "subject": "pulmonary"},
    {"id": "pulm_phys_3", "title": "Oxyhemoglobin Curve", "subject": "pulmonary"},
    {"id": "pulm_phys_4", "title": "Carbon Dioxide Transport", "subject": "pulmonary"},
    {"id": "pulm_path_1", "title": "Obstructive Lung Disease (Asthma/COPD)", "subject": "pulmonary"},
    {"id": "pulm_path_2", "title": "Restrictive Lung Disease", "subject": "pulmonary"},
    {"id": "pulm_path_3", "title": "Pneumonia & Pulmonary Infections", "subject": "pulmonary"},
    {"id": "pulm_path_4", "title": "Tuberculosis", "subject": "pulmonary"},
    {"id": "pulm_path_5", "title": "Pulmonary Embolism & DVT", "subject": "pulmonary"},
    {"id": "pulm_path_6", "title": "Pneumothorax", "subject": "pulmonary"},
    {"id": "pulm_pharma_1", "title": "Asthma & COPD Drugs", "subject": "pulmonary"},

    # Renal
    {"id": "renal_phys_1", "title": "Renal Anatomy & Clearance", "subject": "renal"},
    {"id": "renal_phys_2", "title": "Glomerular Filtration Rate", "subject": "renal"},
    {"id": "renal_phys_3", "title": "Nephron Physiology", "subject": "renal"},
    {"id": "renal_phys_4", "title": "Acid-Base Regulation", "subject": "renal"},
    {"id": "renal_path_1", "title": "Acute Kidney Injury", "subject": "renal"},
    {"id": "renal_path_2", "title": "Glomerulonephritis (Nephritic)", "subject": "renal"},
    {"id": "renal_path_3", "title": "Nephrotic Syndrome", "subject": "renal"},
    {"id": "renal_path_4", "title": "Chronic Kidney Disease", "subject": "renal"},
    {"id": "renal_pharma_1", "title": "Diuretics", "subject": "renal"},

    # Neurology
    {"id": "neuro_phys_1", "title": "Nerve Action Potentials", "subject": "neurology"},
    {"id": "neuro_phys_2", "title": "Cranial Nerves Overview", "subject": "neurology"},
    {"id": "neuro_phys_3", "title": "Spinal Cord Pathways", "subject": "neurology"},
    {"id": "neuro_path_1", "title": "Ischemic Stroke", "subject": "neurology"},
    {"id": "neuro_path_2", "title": "Intracranial Bleeding", "subject": "neurology"},
    {"id": "neuro_path_3", "title": "Meningitis & Encephalitis", "subject": "neurology"},
    {"id": "neuro_path_4", "title": "Demyelinating Diseases", "subject": "neurology"},
    {"id": "neuro_path_5", "title": "Dementias & Parkinson's", "subject": "neurology"},

    # Biochemistry
    {"id": "biochem_met_1", "title": "Glycolysis Pathway", "subject": "biochemistry"},
    {"id": "biochem_met_2", "title": "TCA Cycle", "subject": "biochemistry"},
    {"id": "biochem_met_3", "title": "Electron Transport Chain", "subject": "biochemistry"},
    {"id": "biochem_met_4", "title": "Gluconeogenesis", "subject": "biochemistry"},
    {"id": "biochem_dis_1", "title": "Glycogen Storage Diseases", "subject": "biochemistry"},
    {"id": "biochem_dis_2", "title": "Lysosomal Storage Diseases", "subject": "biochemistry"},

    # Immunology
    {"id": "imm_basic_1", "title": "Innate vs. Adaptive Immunity", "subject": "immunology"},
    {"id": "imm_basic_2", "title": "T & B Cell Development", "subject": "immunology"},
    {"id": "imm_basic_3", "title": "Hypersensitivity Reactions", "subject": "immunology"},
    {"id": "imm_path_1", "title": "Primary Immunodeficiencies", "subject": "immunology"},
    {"id": "imm_path_2", "title": "Autoimmune Diseases", "subject": "immunology"}
]

# Clean strings for matching
def clean_text(text):
    if not text:
        return ""
    # remove punctuation and lowercase
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    return ' '.join(text.split())

# Check if text matches curriculum topic
def match_curriculum(message_text, filename):
    cleaned_msg = clean_text(message_text)
    cleaned_file = clean_text(filename)
    
    combined_source = f"{cleaned_msg} {cleaned_file}"

    for db_video in VIDEO_DATABASE:
        title_keywords = clean_text(db_video["title"]).split()
        # Ensure all keywords of database title are in the message or filename
        matched = True
        for kw in title_keywords:
            if kw not in combined_source:
                matched = False
                break
        if matched:
            return db_video
            
    return None

# Progress indicator callback
def progress_callback(downloaded, total):
    if not total:
        return
    percent = (downloaded / total) * 100
    bar_length = 30
    filled_length = int(bar_length * downloaded // total)
    bar = '█' * filled_length + '-' * (bar_length - filled_length)
    sys.stdout.write(f'\rProgress: |{bar}| {percent:.1f}% ({downloaded / (1024*1024):.1f}MB / {total / (1024*1024):.1f}MB)')
    sys.stdout.flush()

async def main():
    print("==============================================================")
    print("   Boards & Beyond Telegram Video Downloader & Sorter         ")
    print("==============================================================")
    print("Please retrieve your API_ID and API_HASH from:")
    print("👉 https://my.telegram.org/apps\n")

    api_id_str = input("Enter your Telegram API ID: ").strip()
    if not api_id_str:
        print("API ID is required.")
        return
    
    api_id = int(api_id_str)
    api_hash = input("Enter your Telegram API HASH: ").strip()
    if not api_hash:
        print("API HASH is required.")
        return

    channel_name = 'USMLEBoardsAndBeyondVideos'
    base_dir = os.path.dirname(os.path.abspath(__file__))
    videos_dir = os.path.join(base_dir, 'videos')

    # Create target directories
    for subj in set(v["subject"] for v in VIDEO_DATABASE):
        os.makedirs(os.path.join(videos_dir, subj), exist_ok=True)

    print(f"\nInitializing client and connecting to Telegram...")
    client = TelegramClient('bb_downloader_session', api_id, api_hash)
    await client.start()

    print(f"Connecting to channel @{channel_name}...")
    try:
        channel = await client.get_entity(channel_name)
    except Exception as e:
        print(f"Error accessing channel @{channel_name}: {e}")
        return

    print("\nStarting message scan (scraping channel feed)...")
    print("Scanning videos and matching them to your Study Curriculum...")
    
    matched_count = 0
    download_queue = []

    # Iterate through messages
    async for message in client.iter_messages(channel):
        # We only care about messages with video documents
        if message.media and isinstance(message.media, MessageMediaDocument):
            doc = message.media.document
            # Check mime type is video
            if not doc.mime_type.startswith('video/'):
                continue
                
            # Get video file name if any
            filename = ""
            for attr in doc.attributes:
                if hasattr(attr, 'file_name') and attr.file_name:
                    filename = attr.file_name
                    break

            msg_text = message.text or ""
            
            # Match message to our curriculum database
            matched_video = match_curriculum(msg_text, filename)
            
            if matched_video:
                dest_path = os.path.join(videos_dir, matched_video["subject"], f"{matched_video['id']}.mp4")
                
                # Check if already downloaded
                if os.path.exists(dest_path) and os.path.getsize(dest_path) > 0:
                    continue  # already downloaded, skip
                    
                download_queue.append({
                    "message": message,
                    "db_video": matched_video,
                    "dest_path": dest_path
                })
                matched_count += 1
                print(f"  [FOUND MATCH] Message {message.id} -> '{matched_video['title']}' ({matched_video['subject']})")

    print(f"\nScan completed. Found {matched_count} missing videos to download.")
    if matched_count == 0:
        print("Everything is up to date! No missing videos to download.")
        return

    input("\nPress ENTER to start batch downloading...")

    for i, item in enumerate(download_queue, 1):
        db_vid = item["db_video"]
        dest = item["dest_path"]
        msg = item["message"]
        
        print(f"\n[{i}/{matched_count}] Downloading: '{db_vid['title']}'...")
        print(f"Saving to: {os.path.relpath(dest, base_dir)}")
        
        try:
            # Download file directly
            await msg.download_media(file=dest, progress_callback=progress_callback)
            print("\nDownload finished successfully!")
        except KeyboardInterrupt:
            print("\nDownload interrupted by user.")
            if os.path.exists(dest):
                os.remove(dest) # clean up partial file
            break
        except Exception as e:
            print(f"\nFailed to download: {e}")
            if os.path.exists(dest):
                os.remove(dest) # clean up partial file

    print("\nBatch process finished. You can now refresh your Study Companion web app!")

if __name__ == '__main__':
    asyncio.run(main())
