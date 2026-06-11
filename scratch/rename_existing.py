import os

base_dir = r"d:\Med\Exam-blanc"
videos_dir = os.path.join(base_dir, "videos")
gastro_dir = os.path.join(videos_dir, "gastroenterology")

FILE_MAPPING = {
    # Anatomy & Physiology
    "Gastroenterology_1_Anatomy_1_Gastrointestinal_Embryology.mp4": "gi_phys_10.mp4",
    "Gastroenterology - 1. Anatomy - 2.Gastrointestinal Anatomy.mp4": "gi_phys_1.mp4",
    "Gastroenterology_1_Anatomy_3_Gastrointestinal_Blood_Supply.mp4": "gi_phys_11.mp4",
    "Gastroenterology - 1. Anatomy - 4.Gastrointestinal Tract.mp4": "gi_phys_5.mp4",
    "Gastroenterology_1_Anatomy_5_Liver,_Gallbladder,_and_Pancreas.mp4": "gi_phys_12.mp4",
    "Gastroenterology - 1. Anatomy - 6.Salivary Glands.mp4": "gi_phys_6.mp4",
    "Gastroenterology - 1. Anatomy - 7.Hernias.mp4": "gi_phys_7.mp4",
    "Gastroenterology - 2. GI Physiology - 1.Bile.mp4": "gi_phys_8.mp4",
    "Gastroenterology - 2. GI Physiology - 2.Bilirubin.mp4": "gi_phys_4.mp4",
    "Gastroenterology_2_GI_Physiology_3_Gastrointestinal_Secretions.mp4": "gi_phys_2.mp4",
    "Gastroenterology_2_GI_Physiology_4_Gastrointestinal_Hormones.mp4": "gi_phys_13.mp4",
    "Gastroenterology - 2. GI Physiology - 5.Exocrine Pancreas.mp4": "gi_phys_9.mp4",
    
    # Clinical Pathology
    "070 - Esophagus and Stomach - Esophageal Disorders @Vid4Med.mp4": "gi_path_1.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_1_Esophageal_Disorders.mp4": "gi_path_1.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_2_Liver_Disease.mp4": "gi_path_5.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_3_Cirrhosis.mp4": "gi_path_4.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_4_Liver_Tumors.mp4": "gi_path_11.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_5_Wilson's_Disease.mp4": "gi_path_12.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_6_Gallstones.mp4": "gi_path_6c.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_7_Biliary_Disorders.mp4": "gi_path_6d.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_8_Gastric_Disorders.mp4": "gi_path_2.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_9_Malabsorption.mp4": "gi_path_7.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_10_Acute_Pancreatitis.mp4": "gi_path_6a.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_11_Chronic_Pancreatitis.mp4": "gi_path_6b.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_13_Inflammatory_Bowel.mp4": "gi_path_3.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_14_Colon_Cancer.mp4": "gi_path_8.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_15_Carcinoid_Tumors.mp4": "gi_path_9.mp4",
    "Gastroenterology_3_Clinical_Gastroenterology_16_Gastrointestinal.mp4": "gi_path_10.mp4",
}

print("Renaming gastroenterology videos...")
count = 0
for src_name, dest_name in FILE_MAPPING.items():
    src_path = os.path.join(gastro_dir, src_name)
    dest_path = os.path.join(gastro_dir, dest_name)
    if os.path.exists(src_path):
        print(f"Renaming '{src_name}' -> '{dest_name}'")
        try:
            # If destination already exists, remove it first
            if os.path.exists(dest_path) and dest_path != src_path:
                os.remove(dest_path)
            os.rename(src_path, dest_path)
            count += 1
        except Exception as e:
            print(f"Error renaming {src_name}: {e}")
    else:
        # Check if already renamed
        if os.path.exists(dest_path):
            print(f"'{dest_name}' already renamed")
        else:
            print(f"Source file not found: {src_name}")

print(f"Done renaming {count} files.")
