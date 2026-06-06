// "Exam Blanc" Interactive Website Logic
// Contains the question database and state management

// ----------------------------------------------------
// 1. Question Database
// ----------------------------------------------------
// Vectorized Spirometry Report Component
const spirometryHtml = `
<div class="spirometry-report">
    <div class="spiro-header">
        <div class="spiro-headline">Rapport de Spirométrie</div>
        <div class="spiro-meta-grid">
            <div><strong>Sexe :</strong> Masculin</div>
            <div><strong>Âge :</strong> 66 ans</div>
            <div><strong>Taille :</strong> 167 cm</div>
            <div><strong>Poids :</strong> 56 kg</div>
            <div><strong>IMC :</strong> 20.1</div>
            <div><strong>Ethnie :</strong> Caucasien</div>
            <div><strong>Fumeur :</strong> Non</div>
            <div><strong>Asthme :</strong> -</div>
            <div><strong>BPCO :</strong> Non</div>
        </div>
    </div>
    
    <div class="spiro-summary-alert">
        Votre VEMS/théorique : <strong>38 %</strong> (Trouble Ventilatoire Obstructif Sévère)
    </div>
    
    <div class="spiro-charts-table-grid">
        <div class="spiro-charts-column">
            <!-- SVG Flow-Volume Loop -->
            <div class="spiro-chart-box">
                <div class="spiro-chart-title">Boucle Débit-Volume (ex/in)</div>
                <svg viewBox="0 0 300 240" class="spiro-svg">
                    <line x1="50" y1="20" x2="50" y2="220" class="spiro-axis-line" />
                    <line x1="10" y1="120" x2="280" y2="120" class="spiro-axis-line" />
                    <line x1="77.5" y1="20" x2="77.5" y2="220" class="spiro-grid-line" />
                    <line x1="105" y1="20" x2="105" y2="220" class="spiro-grid-line" />
                    <line x1="132.5" y1="20" x2="132.5" y2="220" class="spiro-grid-line" />
                    <line x1="160" y1="20" x2="160" y2="220" class="spiro-grid-line" />
                    <line x1="187.5" y1="20" x2="187.5" y2="220" class="spiro-grid-line" />
                    <line x1="215" y1="20" x2="215" y2="220" class="spiro-grid-line" />
                    <line x1="242.5" y1="20" x2="242.5" y2="220" class="spiro-grid-line" />
                    <line x1="10" y1="48.6" x2="280" y2="48.6" class="spiro-grid-line" />
                    <line x1="10" y1="84.3" x2="280" y2="84.3" class="spiro-grid-line" />
                    <line x1="10" y1="155.7" x2="280" y2="155.7" class="spiro-grid-line" />
                    <line x1="10" y1="191.4" x2="280" y2="191.4" class="spiro-grid-line" />
                    <text x="40" y="12" class="spiro-axis-label">Débit [L/s]</text>
                    <text x="42" y="52" class="spiro-axis-label">10</text>
                    <text x="45" y="87" class="spiro-axis-label">5</text>
                    <text x="42" y="159" class="spiro-axis-label">-5</text>
                    <text x="39" y="195" class="spiro-axis-label">-10</text>
                    <text x="282" y="124" class="spiro-axis-label">Volume [L]</text>
                    <text x="74" y="132" class="spiro-axis-label">1</text>
                    <text x="101" y="132" class="spiro-axis-label">2</text>
                    <text x="129" y="132" class="spiro-axis-label">3</text>
                    <text x="156" y="132" class="spiro-axis-label">4</text>
                    <text x="184" y="132" class="spiro-axis-label">5</text>
                    <text x="211" y="132" class="spiro-axis-label">6</text>
                    <text x="239" y="132" class="spiro-axis-label">7</text>
                    <path d="M 50 120 Q 77.5 55.7 77.5 55.7 L 182 120 A 66 32 0 0 1 50 120" class="spiro-curve-pred" />
                    <path d="M 50 120 Q 56.8 92 63.7 92 C 80 115 105 119 115.4 120 A 32.7 18 0 0 1 50 120" class="spiro-curve-pre" />
                    <path d="M 50 120 Q 58.2 95 66.5 95 C 85 112 112 118 124.5 120 A 37.2 20 0 0 1 50 120" class="spiro-curve-post" />
                    <rect x="180" y="25" width="90" height="40" rx="3" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="0.5" />
                    <line x1="185" y1="33" x2="200" y2="33" class="spiro-curve-pred" />
                    <text x="205" y="36" class="spiro-axis-label" style="font-size: 7px;">Théorique</text>
                    <line x1="185" y1="43" x2="200" y2="43" class="spiro-curve-pre" />
                    <text x="205" y="46" class="spiro-axis-label" style="font-size: 7px;">Pré-BD</text>
                    <line x1="185" y1="53" x2="200" y2="53" class="spiro-curve-post" />
                    <text x="205" y="56" class="spiro-axis-label" style="font-size: 7px;">Post-BD</text>
                </svg>
            </div>
            
            <!-- SVG Volume-Time Curve -->
            <div class="spiro-chart-box">
                <div class="spiro-chart-title">Volume-Temps</div>
                <svg viewBox="0 0 300 200" class="spiro-svg">
                    <line x1="40" y1="20" x2="40" y2="180" class="spiro-axis-line" />
                    <line x1="40" y1="180" x2="290" y2="180" class="spiro-axis-line" />
                    <line x1="70" y1="20" x2="70" y2="180" class="spiro-grid-line" />
                    <line x1="100" y1="20" x2="100" y2="180" class="spiro-grid-line" />
                    <line x1="130" y1="20" x2="130" y2="180" class="spiro-grid-line" />
                    <line x1="160" y1="20" x2="160" y2="180" class="spiro-grid-line" />
                    <line x1="190" y1="20" x2="190" y2="180" class="spiro-grid-line" />
                    <line x1="220" y1="20" x2="220" y2="180" class="spiro-grid-line" />
                    <line x1="250" y1="20" x2="250" y2="180" class="spiro-grid-line" />
                    <line x1="280" y1="20" x2="280" y2="180" class="spiro-grid-line" />
                    <line x1="40" y1="148" x2="290" y2="148" class="spiro-grid-line" />
                    <line x1="40" y1="116" x2="290" y2="116" class="spiro-grid-line" />
                    <line x1="40" y1="84" x2="290" y2="84" class="spiro-grid-line" />
                    <line x1="40" y1="52" x2="290" y2="52" class="spiro-grid-line" />
                    <line x1="40" y1="20" x2="290" y2="20" class="spiro-grid-line" />
                    <text x="30" y="15" class="spiro-axis-label">Vol. [L]</text>
                    <text x="32" y="151" class="spiro-axis-label">1</text>
                    <text x="32" y="119" class="spiro-axis-label">2</text>
                    <text x="32" y="87" class="spiro-axis-label">3</text>
                    <text x="32" y="55" class="spiro-axis-label">4</text>
                    <text x="32" y="23" class="spiro-axis-label">5</text>
                    <text x="270" y="192" class="spiro-axis-label">Temps [s]</text>
                    <text x="67" y="190" class="spiro-axis-label">1</text>
                    <text x="97" y="190" class="spiro-axis-label">2</text>
                    <text x="127" y="190" class="spiro-axis-label">3</text>
                    <text x="157" y="190" class="spiro-axis-label">4</text>
                    <text x="187" y="190" class="spiro-axis-label">5</text>
                    <text x="217" y="190" class="spiro-axis-label">6</text>
                    <text x="247" y="190" class="spiro-axis-label">7</text>
                    <text x="277" y="190" class="spiro-axis-label">8</text>
                    <path d="M 40 180 Q 70 120 120 108 T 244 103.8" class="spiro-curve-pre" />
                    <path d="M 40 180 Q 70 110 120 98 T 280 93.3" class="spiro-curve-post" />
                </svg>
            </div>
        </div>
        
        <div class="spiro-table-column">
            <div class="spiro-table-wrapper">
                <table class="spiro-table">
                    <thead>
                        <tr>
                            <th>Paramètre</th>
                            <th>Théo</th>
                            <th>Lim (LLN)</th>
                            <th>Pré-BD</th>
                            <th>Pré %</th>
                            <th>Post-BD</th>
                            <th>Post %</th>
                            <th>% Chg</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>CVF (L)</strong></td>
                            <td>3.88</td>
                            <td>3.05</td>
                            <td class="flagged-val">2.38*</td>
                            <td>61</td>
                            <td class="flagged-val">2.71*</td>
                            <td>70</td>
                            <td class="flagged-val">14*</td>
                        </tr>
                        <tr>
                            <td><strong>VEMS (L)</strong></td>
                            <td>2.88</td>
                            <td>2.18</td>
                            <td class="flagged-val">1.10*</td>
                            <td>38</td>
                            <td class="flagged-val">1.38*</td>
                            <td>48</td>
                            <td class="flagged-val">25*</td>
                        </tr>
                        <tr>
                            <td><strong>VEMS/CVF</strong></td>
                            <td>0.744</td>
                            <td>0.647</td>
                            <td class="flagged-val">0.464*</td>
                            <td>62</td>
                            <td class="flagged-val">0.510*</td>
                            <td>68</td>
                            <td>10</td>
                        </tr>
                        <tr>
                            <td><strong>DEF25-75 (L/s)</strong></td>
                            <td>2.29</td>
                            <td>0.88</td>
                            <td class="flagged-val">0.42*</td>
                            <td>18</td>
                            <td class="flagged-val">0.61*</td>
                            <td>27</td>
                            <td>46</td>
                        </tr>
                        <tr>
                            <td><strong>DEP (L/s)</strong></td>
                            <td>7.81</td>
                            <td>5.76</td>
                            <td class="flagged-val">3.92*</td>
                            <td>50</td>
                            <td class="flagged-val">3.49*</td>
                            <td>45</td>
                            <td>-11</td>
                        </tr>
                        <tr>
                            <td><strong>TEF (s)</strong></td>
                            <td>-</td>
                            <td>-</td>
                            <td>6.8</td>
                            <td>-</td>
                            <td>8.0</td>
                            <td>-</td>
                            <td>17</td>
                        </tr>
                        <tr>
                            <td><strong>CVIF (L)</strong></td>
                            <td>3.88</td>
                            <td>3.05</td>
                            <td class="flagged-val">2.68*</td>
                            <td>69</td>
                            <td class="flagged-val">2.94*</td>
                            <td>76</td>
                            <td>10</td>
                        </tr>
                        <tr>
                            <td><strong>DEP (L/s)</strong></td>
                            <td>-</td>
                            <td>-</td>
                            <td>4.90</td>
                            <td>-</td>
                            <td>4.11</td>
                            <td>-</td>
                            <td>-16</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="spiro-quality-box">
                <strong>Qualité du test :</strong><br>
                • Pré-BD : A (Var VEMS = 0.01L [0.7%] ; Var CVF = 0.03L [1.2%])<br>
                • Post-BD : B (Var VEMS = 0.04L [3.0%] ; Var CVF = 0.12L [4.5%])<br>
                <span style="color: var(--color-danger); font-size: 8px;">* Valeurs inférieures à la limite inférieure de la normale (LLN) ou changement significatif.</span>
            </div>
        </div>
    </div>
</div>
`;

const questions = [
{
        id: 1,
        category: "Gastro-entérologie",
        type: "qcm",
        text: "On doit explorer (Biologie, Endoscopie, ...) une diarrhée aiguë quand elle est associée à au moins un des éléments suivants :",
        options: [
            { id: "a", text: "Une durée qui dépasse 7 jours" },
            { id: "b", text: "La présence d'une hypothermie ou d'une fièvre" },
            { id: "c", text: "La présence de sang dans les selles" },
            { id: "d", text: "L'absence de réponse au traitement symptomatique" },
            { id: "e", text: "La présence d'un âge extrême" }
        ],
        draftCorrectAnswers: ["a", "c", "d", "e"],
        explanation: "Les indications à l'exploration d'une diarrhée aiguë incluent la persistance au-delà de 7 jours, le syndrome dysentérique (sang/pus dans les selles), l'échec d'un traitement bien conduit, les âges extrêmes (nourrissons, personnes âgées) et les terrains d'immunodépression."
    },
{
        id: 2,
        category: "Pneumologie - Cas Clinique 1 (Partie 1)",
        type: "text",
        text: "Un patient âgé de 56 ans, vient vous voir en consultation, et a ramené avec lui une radiographie thoracique (Ci-dessous) réalisée dans le cadre d'un bilan d'embauche. Veuillez interpréter cette radiographie :",
        image: "images/fig_56yo_xray.jpg",
        modelAnswer: "La radiographie thoracique de face montre une opacité nodulaire ou de type nodule pulmonaire solitaire, bien circonscrite au niveau du champ pulmonaire moyen/supérieur droit (ou une image suspecte à typer). Il n'y a pas d'épanchement pleural liquide ou gazeux associé. Les apex et les culs-de-sac costo-diaphragmatiques sont libres.",
        explanation: "L'interprétation doit noter la présence d'une opacité ronde/nodulaire isolée (nodule solitaire) et l'absence d'autres anomalies pleurales ou parenchymateuses majeures."
    },
{
        id: 3,
        category: "Pneumologie - Cas Clinique 1 (Partie 2)",
        type: "text",
        text: "Un patient âgé de 56 ans, vient vous voir en consultation, et a ramené avec lui une radiographie thoracique réalisée dans le cadre d'un bilan d'embauche. Quels sont les éléments de l'anamnèse (Facteurs de risque, Antécédents, Histoire de la maladie) qui vont vous orienter vers vos hypothèses diagnostiques ?",
        image: "images/fig_56yo_xray.jpg",
        modelAnswer: "Les éléments clés à rechercher à l'anamnèse sont :
- Le statut tabagique (actif/sevré, calcul de l'exposition en paquets-années).
- Des antécédents personnels ou familiaux de cancer (pulmonaire ou autre).
- Des expositions professionnelles à des carcinogènes (amiante, silice, métaux lourds).
- La présence de symptômes cliniques infracliniques (perte de poids, fatigue, toux récente, expectorations, hémoptysie minime, fébricule).
- Des antécédents d'infections respiratoires sévères ou de tuberculose (cicatrice parenchymateuse).",
        explanation: "Ces facteurs de risque et antécédents permettent d'évaluer la probabilité de malignité du nodule découvert fortuitement."
    },
{
        id: 4,
        category: "Pneumologie - Cas Clinique 1 (Partie 3)",
        type: "text",
        text: "Un patient âgé de 56 ans, vient vous voir en consultation, et a ramené avec lui une radiographie thoracique réalisée dans le cadre d'un bilan d'embauche. Sachant que c'est un sujet non-tabagique, sans antécédents notables, asymptomatique, et dont l'examen clinique est sans particularités ; quel est votre diagnostic le plus probable, et quelle est votre conduite à tenir ?",
        image: "images/fig_56yo_xray.jpg",
        modelAnswer: "Le diagnostic le plus probable est un nodule pulmonaire solitaire bénin (probablement un hamartochondrome ou un granulome cicatriciel infectieux). 
Conduite à tenir :
1. Récupérer des clichés radiographiques antérieurs pour comparer (un nodule stable depuis plus de 2 ans est hautement suspect de bénignité).
2. Réaliser un scanner (TDM) thoracique haute résolution sans et avec injection pour mieux caractériser le nodule (taille exacte, présence de calcifications en pop-corn typiques de l'hamartochondrome, densité de graisse).
3. En l'absence de critères de malignité évidents au scanner, instaurer une surveillance radiologique stricte (scanner à 3, 6, 12 et 24 mois).",
        explanation: "Chez un sujet jeune asymptomatique non tabagique sans antécédent, la bénignité d'un nodule solitaire est la règle. La caractérisation scanographique et la surveillance sont recommandées."
    },
{
        id: 5,
        category: "Pneumologie - Cas Clinique Hémoptysies (Partie 1)",
        type: "text",
        text: "Un patient se présente à votre consultation pour des hémoptysies. La Rx thoracique est la suivante (Ci-dessous). Quelles sont vos hypothèses diagnostiques ?",
        image: "images/fig_hemoptysis_xray.jpg",
        modelAnswer: "Les hypothèses diagnostiques principales devant ce tableau d'hémoptysie associé à une opacité excavée ou infiltrante apicale sont :
1. Tuberculose pulmonaire active (caverne tuberculeuse).
2. Cancer bronchopulmonaire primitif nécrosé (surtout chez le sujet tabagique).
3. Aspergillome pulmonaire (greffe sur cavité préexistante).
4. Abcès du poumon excavé.",
        explanation: "Une lésion apicale excavée chez un patient présentant des hémoptysies doit faire évoquer en priorité la tuberculose et le cancer bronchique nécrosé."
    },
{
        id: 6,
        category: "Pneumologie - Cas Clinique Hémoptysies (Partie 2)",
        type: "qcu",
        text: "Un patient se présente à votre consultation pour des hémoptysies. La Rx thoracique montre des anomalies. Parmi les propositions suivantes, quel est l'examen complémentaire le plus pertinent que vous allez prescrire en premier ? (une seule réponse)",
        image: "images/fig_hemoptysis_xray.jpg",
        options: [
            { id: "a", text: "Un examen direct des expectorations (crachats)" },
            { id: "b", text: "Une TDM Thoracique (Scanner)" },
            { id: "c", text: "Une radiographie thoracique de profil" },
            { id: "d", text: "Une échographie cardiaque" },
            { id: "e", text: "Une fibroscopie bronchique" }
        ],
        draftCorrectAnswer: "b",
        explanation: "La TDM thoracique avec injection est l'examen clé en cas d'hémoptysie. Elle permet de localiser le saignement, d'analyser le parenchyme (recherche de caverne, de tumeur, de DDB) et de guider un éventuel geste de radio-embolisation."
    },
{
        id: 7,
        category: "Pneumologie - Cas Clinique 2 (Partie 1)",
        type: "text",
        text: "Patient de 66 ans présentant des épisodes récurrents de toux et de sibilances depuis l'âge de 30 ans. Examen clinique : normal. Sur la base des données cliniques et spirométriques (Ci-dessous), quel est votre diagnostic ?",
        htmlContent: spirometryHtml,
        modelAnswer: "Le diagnostic le plus probable est un Asthme persistant à début précoce (ou asthme de l'adulte), possiblement compliqué d'un trouble ventilatoire obstructif fixe ou partiellement réversible avec le temps (remodelage bronchique), ou un syndrome d'association Asthme-BPCO (ACO). L'histoire de toux et sibilances depuis l'âge de 30 ans est très caractéristique d'un profil asthmatique.",
        explanation: "La triade toux, sibilances récurrentes depuis l'âge jeune et examen intercritique normal évoque fortement l'asthme."
    },
{
        id: 8,
        category: "Pneumologie - Cas Clinique 2 (Partie 2)",
        type: "text",
        text: "Patient de 66 ans présentant des épisodes récurrents de toux et de sibilances depuis l'âge de 30 ans. Examen clinique : normal. Interpréter cette spirométrie (Ci-dessous) :",
        htmlContent: spirometryHtml,
        modelAnswer: "L'interprétation de la courbe spirométrique et des valeurs chiffrées montre :
1. Présence d'un trouble ventilatoire obstructif (TVO) caractérisé par un rapport de Tiffeneau (VEMS/CVF) abaissé en dessous de la limite inférieure de la normale (ou < 70% en valeur absolue).
2. Analyse de la sévérité de l'obstruction selon le niveau du VEMS en % de la valeur théorique.
3. Recherche d'une réversibilité significative après inhalation de 400 µg de Salbutamol (augmentation du VEMS de plus de 12% ET de plus de 200 ml par rapport aux valeurs initiales). Si réversible, cela conforte le diagnostic d'asthme. Si non réversible ou partiellement réversible, cela peut évoquer une BPCO ou un asthme vieilli remodelé.",
        explanation: "La spirométrie est le maître-examen pour diagnostiquer et quantifier un trouble ventilatoire obstructif dans les pathologies respiratoires chroniques."
    },
{
        id: 9,
        category: "Pneumologie - Tuberculose",
        type: "qcu_image",
        text: "Parmi les radiographies suivantes, quel est l'aspect LE plus évocateur de tuberculose ?",
        image: null,
        options: [
            { id: "a", text: "Option A", image: "images/fig_tb_opt_a.jpg" },
            { id: "b", text: "Option B", image: "images/fig_tb_opt_b.jpg" },
            { id: "c", text: "Option C", image: "images/fig_tb_opt_c.jpg" },
            { id: "d", text: "Option D", image: "images/fig_tb_opt_d.jpg" }
        ],
        draftCorrectAnswer: "b",
        explanation: "L'option B montre généralement des lésions infiltratives ou caverneuses apicales bilatérales typiques de la tuberculose pulmonaire active (caverne tuberculeuse)."
    },
{
        id: 10,
        category: "Pneumologie - Thérapeutique",
        type: "matching",
        text: "Devant les différents types de dispositifs inhalés présentés dans l'image ci-dessous, veuillez associer chaque numéro au dispositif correspondant :",
        image: "images/fig_inhalers.jpg",
        matchingItems: [
            { id: "1", label: "Dispositif 1" },
            { id: "2", label: "Dispositif 2" },
            { id: "3", label: "Dispositif 3" },
            { id: "4", label: "Dispositif 4" }
        ],
        options: [
            "Aérosol doseur pressurisé",
            "Aérosol doseur avec chambre d'inhalation",
            "Nébuliseur",
            "Inhalateur de poudre sèche"
        ],
        draftCorrectAnswers: {
            "1": "Inhalateur de poudre sèche",
            "2": "Inhalateur de poudre sèche",
            "3": "Aérosol doseur pressurisé",
            "4": "Aérosol doseur avec chambre d'inhalation"
        },
        explanation: "Le dispositif 1 est un inhalateur de poudre sèche de type Turbuhaler. Le dispositif 2 est également un inhalateur de poudre sèche de type Diskus. Le dispositif 3 est un aérosol doseur pressurisé classique (pMDI). Le dispositif 4 montre un aérosol doseur relié à une chambre d'inhalation (spacer), dispositif indispensable pour optimiser la déposition pulmonaire et réduire les effets secondaires chez de nombreux patients."
    },
{
        id: 11,
        category: "Pneumologie",
        type: "qcm",
        text: "Devant une dyspnée aiguë, la présence d'hémoptysie doit évoquer : (Veuillez choisir AU MOINS UNE RÉPONSE)",
        options: [
            { id: "a", text: "Un syndrome obésité-hypoventilation" },
            { id: "b", text: "Un processus tumoral envahissant la trachée" },
            { id: "c", text: "Une embolie pulmonaire" },
            { id: "d", text: "Une pneumopathie infiltrante diffuse au stade de fibrose" },
            { id: "e", text: "Des séquelles diffuses de tuberculose" }
        ],
        draftCorrectAnswers: ["b", "c"],
        explanation: "Une dyspnée aiguë associée à une hémoptysie évoque en priorité une embolie pulmonaire (infarctus pulmonaire) ou une obstruction tumorale aiguë (cancer bronchique érodant un vaisseau)."
    },
{
        id: 12,
        category: "Hépato-gastro-entérologie",
        type: "qcm",
        text: "Parmi les étiologies suivantes, quelles sont celles qui peuvent être responsables d'une cytolyse chronique ?",
        options: [
            { id: "a", text: "Hémochromatose" },
            { id: "b", text: "Leptospirose" },
            { id: "c", text: "Dysthyroïdie" },
            { id: "d", text: "Hépatite virale (B ou C)" },
            { id: "e", text: "Maladie coeliaque" }
        ],
        draftCorrectAnswers: ["a", "c", "d", "e"],
        explanation: "La cytolyse chronique (augmentation des transaminases > 6 mois) peut être due à une hémochromatose, une dysthyroïdie (hyper/hypothyroïdie), une hépatite virale chronique B ou C, une stéatopathie métabolique, ou encore une maladie coeliaque. La leptospirose est une cause de cytolyse aiguë fébrile."
    },
{
        id: 13,
        category: "Pneumologie - Urgences",
        type: "qcm",
        text: "Patient de 50 ans se présentant aux urgences pour douleur thoracique d'installation brutale. Devant ce tableau clinique une radiographie thoracique de face a été demandée. Sur cette radiographie (Ci-dessous), on note :",
        image: "images/fig_50yo_xray.jpg",
        options: [
            { id: "a", text: "Une ascension de la coupole diaphragmatique droite" },
            { id: "b", text: "Des critères de qualité respectés" },
            { id: "c", text: "Une pleurésie gauche de grande abondance" },
            { id: "d", text: "Une opacité pulmonaire gauche, centrale, suspecte" },
            { id: "e", text: "Un pneumothorax gauche de grande abondance" }
        ],
        draftCorrectAnswers: ["e"],
        explanation: "La radiographie montre une hyperclarté avasculaire occupant tout l'hémithorax gauche avec rétraction du poumon vers le hile (poumon collabé), typique d'un pneumothorax gauche compressif ou de grande abondance."
    },
{
        id: 14,
        category: "Pneumologie - Urgences",
        type: "qcm",
        text: "Patient de 45 ans se présentant aux urgences pour toux productive associée à une fièvre. Une radiographie thoracique de face a été demandée, complétée par une radiographie de profil. Sur ces radiographies (Ci-dessous), on note :",
        image: "images/fig_45yo_xray.jpg",
        options: [
            { id: "a", text: "Une opacité pulmonaire lobaire moyenne systématisée" },
            { id: "b", text: "Un diagnostic probable de pneumonie franche lobaire aiguë (PFLA)" },
            { id: "c", text: "Une opacité pulmonaire lobaire inférieure droite" },
            { id: "d", text: "Une clarté pulmonaire gauche" },
            { id: "e", text: "Une opacité pulmonaire droite non systématisée" }
        ],
        draftCorrectAnswers: ["a", "b"],
        explanation: "L'association d'une opacité triangulaire à limite supérieure nette (systématisée au lobe moyen) effaçant le bord droit du cœur sur la face, et d'un syndrome infectieux aigu, signe une pneumonie lobaire du lobe moyen (PFLA)."
    },
{
        id: 15,
        category: "Gastro-entérologie",
        type: "qcm",
        text: "Quels sont les éléments de gravité à rechercher devant une diarrhée aiguë ?",
        options: [
            { id: "a", text: "Un âge jeune (adulte jeune)" },
            { id: "b", text: "La présence de signes d'infection sévère (Fièvre > 39°C, Hypothermie, choc)" },
            { id: "c", text: "La présence de signes de malabsorption" },
            { id: "d", text: "Un terrain d'immunodépression" },
            { id: "e", text: "La présence de tares associées (cardiaque, rénale...)" }
        ],
        draftCorrectAnswers: ["b", "d", "e"],
        explanation: "Les critères de gravité d'une diarrhée aiguë incluent la déshydratation sévère, le sepsis (fièvre élevée ou hypothermie), l'immunodépression sous-jacente et les comorbidités (tares cardiaques, rénales) exposant au risque de décompensation."
    },
{
        id: 16,
        category: "Pneumologie",
        type: "qcm",
        text: "Parmi les propositions suivantes, quelles sont les étiologies de la dyspnée aiguë ?",
        options: [
            { id: "a", text: "Une pneumonie" },
            { id: "b", text: "Une décompensation acido-cétosique" },
            { id: "c", text: "Une exacerbation d'asthme" },
            { id: "d", text: "Un kyste hydatique du poumon sain non compliqué" },
            { id: "e", text: "Une sténose trachéale post-intubation" }
        ],
        draftCorrectAnswers: ["a", "b", "c", "e"],
        explanation: "La pneumonie, la décompensation de diabète avec acidose (hyperventilation de Kussmaul), l'exacerbation d'asthme et la sténose trachéale (par obstruction) sont des causes classiques de dyspnée aiguë. Un kyste hydatique non compliqué est généralement asymptomatique et de découverte fortuite."
    },
{
        id: 17,
        category: "Pneumologie - Diagnostics",
        type: "qcu",
        text: "Devant une dyspnée aiguë, la présence, dans les antécédents, d'épisodes récurrents de dyspnée expiratoire et de sifflements, doit d'abord évoquer :",
        options: [
            { id: "a", text: "Une exacerbation de BPCO" },
            { id: "b", text: "Un kyste hydatique pulmonaire" },
            { id: "c", text: "Un œdème de Quincke" },
            { id: "d", text: "Une exacerbation d'asthme" },
            { id: "e", text: "Une pneumopathie d'hypersensibilité" }
        ],
        draftCorrectAnswer: "d",
        explanation: "Des épisodes récurrents de dyspnée sifflante paroxystique réversibles dans les antécédents sont la définition clinique classique de l'asthme, rendant l'exacerbation d'asthme le premier diagnostic à évoquer."
    },
{
        id: 18,
        category: "Pneumologie",
        type: "qcm",
        text: "Devant une dyspnée aiguë, la présence de sifflements thoraciques à l'auscultation doit évoquer :",
        options: [
            { id: "a", text: "Une pneumopathie infiltrante diffuse au stade de fibrose" },
            { id: "b", text: "Une bronchectasie diffuse" },
            { id: "c", text: "Une exacerbation de BPCO" },
            { id: "d", text: "Une insuffisance respiratoire chronique restrictive" },
            { id: "e", text: "Un syndrome obésité-hypoventilation" }
        ],
        draftCorrectAnswers: ["c"],
        explanation: "Les sibilants auscultatoires (sifflements) traduisent un bronchospasme ou une obstruction des voies aériennes de petit calibre, caractéristiques de l'exacerbation d'asthme ou de BPCO."
    },
{
        id: 19,
        category: "Hépatologie",
        type: "qcu",
        text: "Le bilan sérologique à demander lors de la suspicion d'une hépatite aiguë B est composé de :",
        options: [
            { id: "a", text: "Antigène HBs, Anticorps anti-HBc type IgM, Anticorps anti-HBs, ADN VHB" },
            { id: "b", text: "Antigène HBs, Anticorps anti-HBc type IgM" },
            { id: "c", text: "Antigène HBs, Anticorps anti-HBc type IgM, Anticorps anti-HBs" },
            { id: "d", text: "Antigène HBs, Anticorps anti-HBc types IgM et IgG, Anticorps anti-HBs" },
            { id: "e", text: "Antigène HBs seul" }
        ],
        draftCorrectAnswer: "b",
        explanation: "Le diagnostic d'une hépatite aiguë B repose sur la mise en évidence simultanée de l'Ag HBs et des anticorps anti-HBc de type IgM (marqueurs de réplication aiguë)."
    },
{
        id: 20,
        category: "Gastro-entérologie",
        type: "qcm",
        text: "La diarrhée aiguë est définie cliniquement par :",
        options: [
            { id: "a", text: "La présence de selles liquidiennes ou molles" },
            { id: "b", text: "La présence d'un syndrome dysentérique" },
            { id: "c", text: "Une évacuation brutale et rapide" },
            { id: "d", text: "La présence de selles graisseuses (stéatorrhée)" },
            { id: "e", text: "Un nombre de selles supérieur à 3 par jour depuis moins de 4 semaines" }
        ],
        draftCorrectAnswers: ["a", "e"],
        explanation: "La diarrhée aiguë est définie par l'émission de plus de 3 selles molles à liquides par jour, évoluant depuis moins de 4 semaines (souvent moins de 14 jours)."
    },
{
        id: 21,
        category: "Pneumologie - Sémiologie",
        type: "qcm",
        text: "Devant cette image de radiographie thoracique (Ci-dessous), on retient :",
        image: "images/fig_pleurisy_xray.jpg",
        options: [
            { id: "a", text: "Un hémithorax opaque rétractile" },
            { id: "b", text: "Parmi les diagnostics possibles, on a une atélectasie pulmonaire totale" },
            { id: "c", text: "L'aspect est en faveur d'une pleurésie de moyenne abondance" },
            { id: "d", text: "Un hémithorax opaque avec distension (déviation controlatérale du médiastin)" },
            { id: "e", text: "Un poumon blanc (épanchement pleural liquidien de grande abondance)" }
        ],
        draftCorrectAnswers: ["d", "e"],
        explanation: "L'image montre une opacité totale et homogène de l'hémithorax gauche ('poumon blanc') avec refoulement du médiastin (trachée et cœur) vers la droite (côté sain/controlatéral), ce qui traduit un épanchement pleural liquide de très grande abondance avec distension."
    },
{
        id: 22,
        category: "Hépatologie",
        type: "qcm",
        text: "L'hépatite aiguë fulminante est caractérisée biologiquement ou cliniquement par :",
        options: [
            { id: "a", text: "La survenue d'une insuffisance rénale aiguë engageant le pronostic vital" },
            { id: "b", text: "L'installation de troubles de la conscience (encéphalopathie hépatique)" },
            { id: "c", text: "La survenue d'un syndrome hémorragique" },
            { id: "d", text: "Un taux de prothrombine (TP) inférieur à 50% (ou plutôt < 20%)" },
            { id: "e", text: "Une fièvre au-delà de 39°C" }
        ],
        draftCorrectAnswers: ["b", "d"],
        explanation: "L'hépatite fulminante est définie par l'association d'une insuffisance hépatocellulaire sévère (TP < 20-30%) et de troubles neurologiques (encéphalopathie hépatique) survenant moins de 2 semaines après le début de l'ictère."
    },
{
        id: 23,
        category: "Pneumologie - Technique radiologique",
        type: "matching_zones",
        text: "Cette image (Ci-dessous) montre les zones anatomiques utilisées pour évaluer la qualité de la radiographie thoracique de face. Prière d'associer à chaque zone numérotée le critère de qualité correspondant :",
        image: "images/fig_quality_zones.jpg",
        zones: ["1", "2", "3", "4", "5", "6", "7"],
        options: [
            "Centrage (Apophyses épineuses centrées entre les clavicules)",
            "Dégagement des apex (Clavicules projetées en dehors ou croisant le 3e espace)",
            "Dégagement des omoplates (Omoplates projetées en dehors des champs pulmonaires)",
            "Culs-de-sac costo-diaphragmatiques externes libres et pris",
            "Pénétrance correcte (Visualisation des vertèbres dorsales derrière le cœur)",
            "Temps inspiratoire correct (Au moins 6 arcs costaux antérieurs visibles)",
            "Symétrie / Orientation correcte"
        ],
        draftCorrectAnswers: {
            "1": "Dégagement des apex (Clavicules projetées en dehors ou croisant le 3e espace)",
            "2": "Centrage (Apophyses épineuses centrées entre les clavicules)",
            "3": "Dégagement des omoplates (Omoplates projetées en dehors des champs pulmonaires)",
            "4": "Temps inspiratoire correct (Au moins 6 arcs costaux antérieurs visibles)",
            "5": "Pénétrance correcte (Visualisation des vertèbres dorsales derrière le cœur)",
            "6": "Culs-de-sac costo-diaphragmatiques externes libres et pris",
            "7": "Symétrie / Orientation correcte"
        },
        explanation: "L'évaluation de la qualité d'une radiographie pulmonaire (critères de clichés de face inspirés du score de Lamy ou critères de qualité classiques) étudie : le centrage (clavicules symétriques), l'inspiration profonde (6 arcs antérieurs visibles), le dégagement des omoplates, le dégagement des sommets (apex), la pénétration (visibilité rétro-cardiaque) et l'inclusion complète des culs-de-sac."
    }
];

// ----------------------------------------------------
// 2. Exam State Management
// ----------------------------------------------------
let currentQuestionIndex = 0;
let userAnswers = {}; // key: questionId, value: user input
let flaggedQuestions = {}; // key: questionId, value: boolean
let visitedQuestions = {}; // key: questionId, value: boolean
let examStartTime = null;
let timerInterval = null;
let examSubmitted = false;

// ----------------------------------------------------
// 3. Persistent State Setup
// ----------------------------------------------------
function loadState() {
    const savedAnswers = localStorage.getItem("eb_user_answers");
    const savedFlagged = localStorage.getItem("eb_flagged_questions");
    const savedVisited = localStorage.getItem("eb_visited_questions");
    const savedStartTime = localStorage.getItem("eb_start_time");
    const savedCurrentIndex = localStorage.getItem("eb_current_index");
    const savedSubmitted = localStorage.getItem("eb_submitted");

    if (savedAnswers) userAnswers = JSON.parse(savedAnswers);
    if (savedFlagged) flaggedQuestions = JSON.parse(savedFlagged);
    if (savedVisited) visitedQuestions = JSON.parse(savedVisited);
    if (savedStartTime) examStartTime = parseInt(savedStartTime, 10);
    if (savedCurrentIndex) currentQuestionIndex = parseInt(savedCurrentIndex, 10);
    if (savedSubmitted) examSubmitted = JSON.parse(savedSubmitted);
}

function saveState() {
    localStorage.setItem("eb_user_answers", JSON.stringify(userAnswers));
    localStorage.setItem("eb_flagged_questions", JSON.stringify(flaggedQuestions));
    localStorage.setItem("eb_visited_questions", JSON.stringify(visitedQuestions));
    localStorage.setItem("eb_current_index", currentQuestionIndex.toString());
    localStorage.setItem("eb_submitted", JSON.stringify(examSubmitted));
    if (examStartTime) {
        localStorage.setItem("eb_start_time", examStartTime.toString());
    }
}

function resetState() {
    userAnswers = {};
    flaggedQuestions = {};
    visitedQuestions = {};
    currentQuestionIndex = 0;
    examStartTime = Date.now();
    examSubmitted = false;
    localStorage.clear();
    saveState();
}

// ----------------------------------------------------
// 4. Timer Logic
// ----------------------------------------------------
function startTimer() {
    if (!examStartTime) {
        examStartTime = Date.now();
        localStorage.setItem("eb_start_time", examStartTime.toString());
    }
    
    updateTimerDisplay();
    timerInterval = setInterval(() => {
        if (!examSubmitted) {
            updateTimerDisplay();
        } else {
            clearInterval(timerInterval);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const elapsedMs = Date.now() - examStartTime;
    const totalSecs = Math.floor(elapsedMs / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    
    const formatted = 
        (hours > 0 ? String(hours).padStart(2, '0') + ":" : "") +
        String(minutes).padStart(2, '0') + ":" + 
        String(seconds).padStart(2, '0');
        
    const timerEl = document.getElementById("examTimer");
    if (timerEl) {
        timerEl.textContent = formatted;
    }
}

function getFormattedTimeTaken() {
    const elapsedMs = Date.now() - examStartTime;
    const totalSecs = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes} min ${seconds} s`;
}

// ----------------------------------------------------
// 5. Scoring & Correction Helper
// ----------------------------------------------------
function calculateScore() {
    let score = 0;
    let totalQCMs = 0;
    
    questions.forEach(q => {
        if (q.type === "qcm") {
            totalQCMs++;
            const userSelection = userAnswers[q.id] || [];
            const correctSet = q.draftCorrectAnswers;
            
            // Check if user selection matches correct answers exactly
            const correctSetSorted = [...correctSet].sort();
            const userSelectionSorted = [...userSelection].sort();
            
            const isCorrect = correctSetSorted.length === userSelectionSorted.length &&
                correctSetSorted.every((val, index) => val === userSelectionSorted[index]);
                
            if (isCorrect) {
                score++;
            }
        } else if (q.type === "qcu" || q.type === "qcu_image") {
            totalQCMs++;
            if (userAnswers[q.id] === q.draftCorrectAnswer) {
                score++;
            }
        } else if (q.type === "matching" || q.type === "matching_zones") {
            totalQCMs++;
            const userAnswersObj = userAnswers[q.id] || {};
            const correctAnswersObj = q.draftCorrectAnswers;
            let keys = Object.keys(correctAnswersObj);
            let correctCount = 0;
            keys.forEach(k => {
                if (userAnswersObj[k] === correctAnswersObj[k]) {
                    correctCount++;
                }
            });
            // Partial scoring: if all sub-items match, we add 1.
            if (correctCount === keys.length) {
                score++;
            } else if (correctCount > 0) {
                score += (correctCount / keys.length); // partial credit!
            }
        }
        // Note: Free text typing questions (dossiers cases) are not automatically graded
        // but can be reviewed manually side-by-side with model answers.
    });
    
    // Return rounded percentage or fraction
    return {
        score: parseFloat(score.toFixed(2)),
        totalQCMs: totalQCMs,
        percentage: Math.round((score / totalQCMs) * 100)
    };
}

// Export functions to global scope
window.questions = questions;
window.currentQuestionIndex = currentQuestionIndex;
window.userAnswers = userAnswers;
window.flaggedQuestions = flaggedQuestions;
window.visitedQuestions = visitedQuestions;
window.examSubmitted = examSubmitted;
window.loadState = loadState;
window.saveState = saveState;
window.resetState = resetState;
window.startTimer = startTimer;
window.calculateScore = calculateScore;
window.getFormattedTimeTaken = getFormattedTimeTaken;
