# Boards & Beyond Local Video Sorter
# No Telegram login, API keys, or passwords required. 100% offline & secure.

import os
import re
import shutil
import sys

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
    text = re.sub(r'[^\w\s]', ' ', text.lower())
    return ' '.join(text.split())

# Check if filename matches curriculum topic
def match_curriculum(filename):
    cleaned_file = clean_text(filename)
    
    for db_video in VIDEO_DATABASE:
        title_keywords = clean_text(db_video["title"]).split()
        matched = True
        for kw in title_keywords:
            if kw not in cleaned_file:
                matched = False
                break
        if matched:
            return db_video
            
    return None

def main():
    print("==============================================================")
    print("      Boards & Beyond Local Video Sorter & Renamer           ")
    print("==============================================================")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    raw_dir = os.path.join(base_dir, 'raw_downloads')
    videos_dir = os.path.join(base_dir, 'videos')

    # Make raw_downloads folder if it doesn't exist
    if not os.path.exists(raw_dir):
        os.makedirs(raw_dir)
        print(f"Created a folder named: {os.path.relpath(raw_dir, base_dir)}")
        print("👉 Please download the videos from Telegram and drag them into that folder.")
        print("👉 Once you have placed the video files in it, run this script again.")
        return

    # List raw download files
    raw_files = [f for f in os.listdir(raw_dir) if os.path.isfile(os.path.join(raw_dir, f))]
    video_extensions = ('.mp4', '.mkv', '.avi', '.mov', '.flv', '.webm')
    video_files = [f for f in raw_files if f.lower().endswith(video_extensions)]

    if not video_files:
        print(f"No video files found in '{os.path.relpath(raw_dir, base_dir)}' folder.")
        print("👉 Please copy or download your Boards & Beyond video files into that folder first.")
        return

    print(f"Found {len(video_files)} video files to sort.\nScanning...")

    sorted_count = 0
    ignored_count = 0

    for file_name in video_files:
        matched_video = match_curriculum(file_name)
        src_path = os.path.join(raw_dir, file_name)

        if matched_video:
            dest_folder = os.path.join(videos_dir, matched_video["subject"])
            os.makedirs(dest_folder, exist_ok=True)
            
            dest_path = os.path.join(dest_folder, f"{matched_video['id']}.mp4")
            
            print(f"  [MATCH] '{file_name}'")
            print(f"    --> Renaming & Moving to: videos/{matched_video['subject']}/{matched_video['id']}.mp4")
            
            try:
                shutil.move(src_path, dest_path)
                sorted_count += 1
            except Exception as e:
                print(f"    Error moving file: {e}")
        else:
            print(f"  [SKIPPED] '{file_name}' (Could not match title to database)")
            ignored_count += 1

    print("\n--------------------------------------------------------------")
    print(f"Processing complete!")
    print(f"  Successfully sorted: {sorted_count} videos")
    print(f"  Unmatched/Skipped  : {ignored_count} files")
    print("--------------------------------------------------------------")
    print("You can now start your web server and reload the companion!")

if __name__ == '__main__':
    main()
