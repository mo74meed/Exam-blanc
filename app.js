// Boards & Beyond Study Companion Curriculum Database
// Customized for user's downloaded files

const subjects = {
  gastroenterology: {
    id: "gastroenterology",
    title: "Gastroenterology",
    description: "Esophagus, stomach, intestines, liver, biliary tract, and pancreas.",
    icon: "🍔",
    sections: [
      {
        title: "Anatomy & Physiology",
        videos: [
          { id: "gi_phys_10", title: "Gastrointestinal Embryology", duration: "18:45" },
          { id: "gi_phys_1", title: "Gastrointestinal Anatomy", duration: "15:30" },
          { id: "gi_phys_11", title: "Gastrointestinal Blood Supply", duration: "12:15" },
          { id: "gi_phys_5", title: "Gastrointestinal Tract", duration: "22:10" },
          { id: "gi_phys_12", title: "Liver, Gallbladder, and Pancreas", duration: "19:05" },
          { id: "gi_phys_6", title: "Salivary Glands", duration: "10:15" },
          { id: "gi_phys_7", title: "Hernias", duration: "08:30" },
          { id: "gi_phys_8", title: "Bile", duration: "11:45" },
          { id: "gi_phys_4", title: "Bilirubin Metabolism", duration: "14:50" },
          { id: "gi_phys_2", title: "Gastrointestinal Secretions", duration: "12:45" },
          { id: "gi_phys_13", title: "Gastrointestinal Hormones", duration: "16:20" },
          { id: "gi_phys_9", title: "Exocrine Pancreas", duration: "13:10" }
        ]
      },
      {
        title: "Clinical Pathology",
        videos: [
          { id: "gi_path_1", title: "Esophageal Disorders", duration: "22:10" },
          { id: "gi_path_2", title: "Gastric Disorders", duration: "18:40" },
          { id: "gi_path_7", title: "Malabsorption", duration: "23:20" },
          { id: "gi_path_3", title: "Inflammatory Bowel Disease", duration: "24:15" },
          { id: "gi_path_8", title: "Colon Cancer", duration: "20:50" },
          { id: "gi_path_9", title: "Carcinoid Tumors", duration: "14:15" },
          { id: "gi_path_5", title: "Liver Disease", duration: "16:15" },
          { id: "gi_path_4", title: "Cirrhosis", duration: "21:30" },
          { id: "gi_path_11", title: "Liver Tumors", duration: "17:35" },
          { id: "gi_path_12", title: "Wilson's Disease", duration: "15:20" },
          { id: "gi_path_6c", title: "Gallstones", duration: "14:30" },
          { id: "gi_path_6d", title: "Biliary Disorders", duration: "19:55" },
          { id: "gi_path_6a", title: "Acute Pancreatitis", duration: "25:40" },
          { id: "gi_path_6b", title: "Chronic Pancreatitis", duration: "18:15" },
          { id: "gi_path_10", title: "Gastrointestinal Pharmacology", duration: "26:40" }
        ]
      }
    ]
  },
  pharmacology: {
    id: "pharmacology",
    title: "Pharmacology",
    description: "Pharmacokinetics, pharmacodynamics, and basic therapeutic principles.",
    icon: "🧪",
    sections: [
      {
        title: "Basic Principles",
        videos: [
          { id: "pharma_basic_5", title: "Pharmacokinetics", duration: "26:35" }
        ]
      }
    ]
  },
  cardiology: {
    id: "cardiology",
    title: "Cardiology",
    description: "Heart physiology, pathology, and pharmacology.",
    icon: "🫀",
    sections: [
      {
        title: "Physiology",
        videos: [
          { id: "cardio_phys_1", title: "Cardiac Action Potentials", duration: "18:25" },
          { id: "cardio_phys_2", title: "EKG Basics", duration: "24:10" }
        ]
      }
    ]
  },
  pulmonary: {
    id: "pulmonary",
    title: "Pulmonary",
    description: "Lungs, ventilation, respiratory diseases, and therapeutics.",
    icon: "🫁",
    sections: [
      {
        title: "Physiology",
        videos: [
          { id: "pulm_phys_1", title: "Lung Anatomy & Mechanics", duration: "16:40" },
          { id: "pulm_phys_2", title: "Ventilation & Perfusion", duration: "22:15" }
        ]
      }
    ]
  }
};

// Helper function to get a flat list of all videos
function getAllVideos() {
  const list = [];
  for (const subjectId in subjects) {
    const subject = subjects[subjectId];
    subject.sections.forEach(section => {
      section.videos.forEach(video => {
        list.push({
          ...video,
          subjectId: subject.id,
          subjectTitle: subject.title,
          sectionTitle: section.title
        });
      });
    });
  }
  return list;
}

// Helper function to find a specific video by ID
function findVideoById(id) {
  const all = getAllVideos();
  return all.find(v => v.id === id) || null;
}
