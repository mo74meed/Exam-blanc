import os
import shutil

telegram_dir = "C:\\Users\\moham\\Downloads\\Telegram Desktop"
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
videos_dir = os.path.join(base_dir, "videos")

# Exact file-to-path mapping
FILE_MAPPING = {
    # Anatomy & Physiology
    "Gastroenterology_1_Anatomy_1_Gastrointestinal_Embryology.mp4": "gastroenterology/gi_phys_10.mp4",
    "Gastroenterology - 1. Anatomy - 2.Gastrointestinal Anatomy.mp4": "gastroenterology/gi_phys_1.mp4",
    "Gastroenterology_1_Anatomy_3_Gastrointestinal_Blood_Supply.mp4": "gastroenterology/gi_phys_11.mp4",
    "Gastroenterology - 1. Anatomy - 4.Gastrointestinal Tract.mp4": "gastroenterology/gi_phys_5.mp4",
    "Gastroenterology_1_Anatomy_5_Liver,_Gallbladder,_and_Pancreas.mp4": "gastroenterology/gi_phys_12.mp4",
    "Gastroenterology - 1. Anatomy - 6.Salivary Glands.mp4": "gastroenterology/gi_phys_6.mp4",
    "Gastroenterology - 1. Anatomy - 7.Hernias.mp4": "gastroenterology/gi_phys_7.mp4",
    "Gastroenterology - 2. GI Physiology - 1.Bile.mp4": "gastroenterology/gi_phys_8.mp4",
    "Gastroenterology - 2. GI Physiology - 2.Bilirubin.mp4": "gastroenterology/gi_phys_4.mp4",
    "Gastroenterology_2_GI_Physiology_3_Gastrointestinal_Secretions.mp4": "gastroenterology/gi_phys_2.mp4",
    "Gastroenterology_2_GI_Physiology_4_Gastrointestinal_Hormones.mp4": "gastroenterology/gi_phys_13.mp4",
    "Gastroenterology - 2. GI Physiology - 5.Exocrine Pancreas.mp4": "gastroenterology/gi_phys_9.mp4",
    
    # Clinical Pathology
    "070 - Esophagus and Stomach - Esophageal Disorders @Vid4Med.mp4": "gastroenterology/gi_path_1.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_1_Esophageal_Disorders.mp4": "gastroenterology/gi_path_1.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_2_Liver_Disease.mp4": "gastroenterology/gi_path_5.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_3_Cirrhosis.mp4": "gastroenterology/gi_path_4.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_4_Liver_Tumors.mp4": "gastroenterology/gi_path_11.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_5_Wilson's_Disease.mp4": "gastroenterology/gi_path_12.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_6_Gallstones.mp4": "gastroenterology/gi_path_6c.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_7_Biliary_Disorders.mp4": "gastroenterology/gi_path_6d.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_8_Gastric_Disorders.mp4": "gastroenterology/gi_path_2.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_9_Malabsorption.mp4": "gastroenterology/gi_path_7.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_10_Acute_Pancreatitis.mp4": "gastroenterology/gi_path_6a.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_11_Chronic_Pancreatitis.mp4": "gastroenterology/gi_path_6b.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_13_Inflammatory_Bowel.mp4": "gastroenterology/gi_path_3.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_14_Colon_Cancer.mp4": "gastroenterology/gi_path_8.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_15_Carcinoid_Tumors.mp4": "gastroenterology/gi_path_9.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_16_Gastrointestinal.mp4": "gastroenterology/gi_path_10.mp4",
    
    # Pharmacology
    "Basic Pharmacology - 1. Genetal Topics - 5. Pharmacokinetics.mp4": "pharmacology/pharma_basic_5.mp4"
}

print("==============================================================")
print("   Importing and Sorting Gastroenterology & Pharmacology Videos")
print("==============================================================")

copied_count = 0

for file_name, rel_dest in FILE_MAPPING.items():
    # Find the source file recursively in the Telegram Desktop folder
    src_file_path = None
    for root, dirs, files in os.walk(telegram_dir):
        if file_name in files:
            src_file_path = os.path.join(root, file_name)
            break
            
    if src_file_path:
        dest_file_path = os.path.join(videos_dir, rel_dest)
        dest_folder = os.path.dirname(dest_file_path)
        os.makedirs(dest_folder, exist_ok=True)
        
        # Check size if already exists
        if os.path.exists(dest_file_path) and os.path.getsize(dest_file_path) == os.path.getsize(src_file_path):
            print(f"  [SKIPPED] {file_name} (Already imported)")
            continue
            
        print(f"  [COPYING] {file_name} -> {os.path.relpath(dest_file_path, base_dir)}")
        try:
            shutil.copy2(src_file_path, dest_file_path)
            copied_count += 1
        except Exception as e:
            print(f"    Error copying file: {e}")
    else:
        print(f"  [MISSING] {file_name} (Not found in Telegram Downloads)")

print("\n--------------------------------------------------------------")
print(f"Import process complete!")
print(f"  Copied/Sorted: {copied_count} files")
print("--------------------------------------------------------------")
print("You can now restart your web server and open the app!")
