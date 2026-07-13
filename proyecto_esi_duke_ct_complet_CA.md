# Projecte ESI-Duke de Monitorització del Rendiment de CT — Document Exhaustiu

> **Última actualització:** 7 de juliol de 2026
> **Versió anterior:** 3 de juliol de 2026
> **Canvis principals d'aquesta revisió:** arquitectura de desplegament confirmada com a tres components (dcm4chee + Dosense + MongoDB extern), flux de xarxa DICOM i comunicació entre contenidors documentats, dues rondes completes de Q&A amb Duke incorporades, dimensionament proposat per a HCPB, i nova secció d'estat del desplegament a l'Hospital Clínic de Barcelona.

## Índex

1. [Resum del projecte](#resum-del-projecte)
2. [Glossari complet](#glossari-complet)
3. [Contactes i fases](#contactes-i-fases)
4. [Guia de desplegament — Dosense](#guia-de-desplegament--dosense)
5. [Estat del desplegament a HCPB (Hospital Clínic de Barcelona)](#estat-del-desplegament-a-hcpb)
6. [Papers científics — Resums detallats](#papers-científics)
7. [Reunions](#reunions)
8. [Pendents de processar](#pendents-de-processar)

---

## Resum del projecte

### Què és

Col·laboració entre EuroSafe Imaging (campanya de la Societat Europea de Radiologia) i Duke University (EUA) per desplegar un sistema automatitzat de monitorització del rendiment de CT (tomografia computada) en hospitals europeus participants.

### Problema que resol

La monitorització tradicional de CT es centra exclusivament en la dosi de radiació (CTDIvol, DLP). Tanmateix, la dosi és un substitut imperfecte de la qualitat diagnòstica: exàmens amb dosi similar poden diferir substancialment en detectabilitat de lesions a causa de variacions en mida del pacient, geometria d'adquisició, gruix de tall, kernel de reconstrucció i model d'escàner. El projecte introdueix la qualitat d'imatge en l'avaluació del rendiment CT.

### Objectius principals

- Implementar el sistema Dosense (METIS 2, desenvolupat per Duke) en hospitals participants com a software d'anàlisi automatitzat de dosi i qualitat d'imatge CT.
- Assistir equips clínics en l'optimització de protocols CT.
- Habilitar benchmarking de rendiment entre escàners i protocols usant dades anonimitzades.
- Donar suport a futures recomanacions clíniques i regulatòries.

### Disseny operatiu

- Cada hospital instal·la Dosense localment dins de la seva infraestructura IT.
- El sistema processa estudis CT enrutats internament des d'escàners/PACS.
- Realitza anàlisi automatitzat de dosi i qualitat d'imatge.
- Genera dades anònimes (no s'exporta informació identificable del pacient).
- Les imatges DICOM s'eliminen després de l'anàlisi.
- Només resultats numèrics anonimitzats es transfereixen a l'equip del projecte per a comparació i reporting.

### Innovació metodològica

Integració de l'índex de detectabilitat (detectability index, d') com a mètrica task-based de qualitat d'imatge que complementa les mètriques tradicionals de dosi, permetent identificar estudis amb qualitat diagnòstica insuficient o excessiva respecte als seus paràmetres d'adquisició.

### Consideracions ètiques

El projecte no implica canvis en l'atenció clínica. Totes les activitats s'emmarquen en avaluació de qualitat i assegurament del rendiment (quality assurance).

### Context específic de HCPB

- **Volum de referència a l'Hospital Clínic de Barcelona: ~200 estudis CT/dia, ~1.300/setmana.** Aquest és el paràmetre de dimensionament clau per a tot el desplegament local.
- HCPB participa en la Fase 1 del projecte.
- El tech owner per part d'IT/DSI és en Sergi (sysadmin).

**Fitxer font:** Project description.docx

---
## Glossari complet

### CTDIvol (Volume CT Dose Index)
Índex de dosi de CT volumètric, expressat en mGy. És la mesura estandarditzada de la sortida de radiació de l'escàner CT, basada en mesuraments en phantoms cilíndrics de PMMA de 16 o 32 cm. No reflecteix la dosi real al pacient individual ni la qualitat de la imatge resultant.

### DLP (Dose-Length Product)
Producte dosi-longitud, expressat en mGy·cm. Integra el CTDIvol sobre la longitud total de l'scan. S'utilitza per estimar la dosi efectiva mitjançant factors k de conversió, però aquests factors són genèrics (derivats de phantoms sense sexe ni edat) i no representen la diversitat de pacients.

### SSDE (Size-Specific Dose Estimate)
Estimació de dosi específica per mida. Ajusta el CTDIvol segons el diàmetre efectiu del pacient (mesurat des de scouts o imatges CT) per proporcionar una millor aproximació a la dosi absorbida pel pacient. Definida a AAPM Reports 204 i 220.

### Dosi efectiva (Effective Dose, ED)
Suma ponderada de les dosis a tots els òrgans, on els pesos reflecteixen la radiosensibilitat relativa de cada teixit segons ICRP Publication 103. Representa el risc global de radiació del pacient. Es pot estimar via DLP (ED_DLP, genèric) o via dosi d'òrgan (ED_OD, patient-informed).

### Dosi d'òrgan (Organ Dose)
Dosi absorbida per un òrgan específic del pacient. La seva estimació precisa requereix modelatge anatòmic (matching a phantoms computacionals XCAT) i simulació Monte Carlo de la interacció de la radiació. Més rellevant que CTDIvol per avaluar risc real.

### d' (Detectability Index, índex de detectabilitat)
Mètrica task-based de qualitat d'imatge que quantifica la separació estadística entre les distribucions de "lesió present" i "lesió absent" per a un observador model. Valors més alts indiquen més capacitat de detectar la lesió de referència. Es calcula combinant NPS, MTF i una funció de tasca específica.

### d'_ind (in vivo detectability index)
Variant del d' estimada directament des d'imatges de pacients (no de phantoms). Incorpora mesuraments patient-specific de soroll (global noise level) i resolució (MTF des d'interfície pell-aire) juntament amb NPS de phantom escalat. Desenvolupat per Smith, Solomon i Samei (2017).

### NPS (Noise Power Spectrum)
Espectre de potència del soroll. Descriu la distribució de la variància del soroll com a funció de la freqüència espacial. Captura no només la magnitud del soroll sinó la seva textura (patró espacial), que influeix significativament en la detectabilitat de lesions.

### MTF (Modulation Transfer Function)
Funció de transferència de modulació. Quantifica la resolució espacial del sistema d'imatge, és a dir, com el sistema reprodueix contrast a diferents freqüències espacials. En el context d'aquest projecte, es mesura in vivo des de la interfície pell-aire del pacient usant l'ESF (edge-spread function).

### Global Noise Level (nivell de soroll global)
Mètrica automatitzada de soroll en imatges CT clíniques. Es calcula segmentant teixit tou, generant un mapa de desviacions estàndard locals (kernel 6 mm), i prenent la moda de l'histograma resultant. Desenvolupat per Christianson et al. (2015).

### Resolution Index (RI)
Índex de resolució anàleg a la MTF, mesurat des de la interfície pell-aire del pacient. Captura la resolució real de les imatges clíniques incloent variabilitat no representada en phantoms. Desenvolupat per Sanders et al. (2016).

### NPW Matched Filter (Non-PreWhitening Matched Filter)
Model d'observador matemàtic utilitzat per calcular d'. Assumeix que l'observador humà aplica un filtre adaptat a la tasca però no pre-blanqueja (no inverteix la correlació del soroll). Implementat en domini de Fourier.

### WED (Water Equivalent Diameter)
Diàmetre equivalent en aigua. Mesura de la mida efectiva del pacient que integra tant el diàmetre geomètric com l'atenuació radiològica del teixit. Es calcula automàticament des de les imatges CT. Predictor principal del d' en els models multivariable.

### Prediction Interval (PI, interval de predicció)
Rang estadístic esperat per a una observació futura individual de d' donat un conjunt de paràmetres d'adquisició/reconstrucció. Sèries amb d' observat fora del PI al 95% es classifiquen com a outliers de detectabilitat (baixa qualitat = revisió; alta qualitat = potencial reducció de dosi).

### DRL (Diagnostic Reference Level)
Nivell de referència diagnòstica. Valor de dosi (generalment percentil 75 de la distribució nacional/regional) que indica que els estudis que el superen han de ser revisats per a optimització. Concepte d'ICRP. Basat només en dosi.

### QRL (Quality Reference Level)
Nivell de referència de qualitat. Concepte proposat per aquest grup de recerca: llindars basats en d' (o mètriques de qualitat d'imatge) que complementen els DRL de dosi per formar un "Performance Reference Level" complet.

### XCAT Phantoms (Extended Cardiac-Torso)
Biblioteca de phantoms computacionals antropomòrfics desenvolupats per Duke University. Inclouen 58 adults, 56 pediàtrics, 5 embarassades i 12 models de referència ICRP. S'usen per a matching anatòmic en l'estimació de dosi d'òrgan.

### Dosense / METIS 2
Sistema de software desenvolupat per Duke University per a monitorització automatitzada del rendiment CT. Processa estudis DICOM entrants, calcula dosi (incloent dosi d'òrgan) i mètriques de qualitat d'imatge (soroll, resolució, d'), emmagatzema resultats a MongoDB, i elimina les imatges després de l'anàlisi. Desplegat com a contenidor Docker/Podman.

### dcm4chee
PACS/archiver DICOM open source. En el context d'aquest projecte actua com a **estació receptora DICOM** davant de Dosense: accepta les associacions DICOM (C-STORE) de les modalitats i escriu els fitxers a l'arbre de directoris que Dosense vigila. Dosense per si sol no escolta a la xarxa; necessita aquesta peça per rebre estudis. Duke proporciona una imatge Docker de dcm4chee per a aquesta funció.

### EuroSafe Imaging
Campanya de la European Society of Radiology (ESR) dedicada a promoure la protecció radiològica, la qualitat d'imatge i la seguretat en imatge mèdica. Coordina la part europea d'aquest projecte multicèntric.

### 2AFC (Two-Alternative Forced Choice)
Metodologia experimental de percepció en què es presenten a l'observador dues regions i se l'obliga a triar quina conté la lesió. Proporciona una mesura objectiva i lliure de biaix de la capacitat de detecció.

### Clarity
Mètrica normalitzada de detectabilitat desenvolupada per Cheng et al. (2019). Combina soroll i resolució en un valor adimensional que correlaciona fortament amb les preferències de radiòlegs (acord de rang = 1.00).

**Fitxer font:** Síntesi de tots els documents del projecte.

---
## Contactes i fases

### Organitzacions coordinadores

- EuroSafe Imaging Campaign (European Society of Radiology)
- Duke University, EUA

### Contactes principals — Fase 1

- EuroSafe Imaging: John Damilakis (john.damilakis@med.uoc.gr), Alistair Campbell (alistair.campbell@myesr.org / info@eurosafeimaging.org)
- Duke University: Aiping Ding (aiping.ding@duke.edu), Armistead Sapp (Armistead.sapp@duke.edu)
- Bambino Gesù Children's Hospital, Roma: Vittorio Cannatà (vittorio.cannata@opbg.net)
- Torbay and South Devon NHS Foundation Trust: Matthew Rowlandson (m.rowlandson@nhs.net)
- Hospital Clínic de Barcelona: Nuria Bargalló (BARGALLO@clinic.cat), Laura Buñesch (lbunesch@clinic.cat)

> **Nota HCPB:** Nuria Bargalló i Laura Buñesch són les referents clíniques/de projecte per part del Clínic. L'interlocutor tècnic d'IT/DSI és en Sergi (tech owner del desplegament). Aiping Ding i Armistead Sapp són els contactes tècnics de Duke usats per a tota la Q&A d'infraestructura.

### Rols i responsabilitats

- EuroSafe Imaging: Coordinació general, comunicació entre centres, disseminació de resultats.
- Duke University: Proporciona el software (Dosense), suport tècnic, i guia metodològica.
- Cada hospital: Instal·lació i operació local del software, gestió d'aprovacions IT/governança internes, i compartir dades de rendiment anonimitzades com a part de l'anàlisi conjunt.

### Cronograma temptatiu

- Q2 2026: Inici de desplegament en hospitals Fase 1.
- Q3 2026: Preparació tècnica contínua i recollida inicial de dades.
- Finals de 2026: Primers informes de rendiment.
- 2027: Incorporació d'hospitals addicionals en fases posteriors.

### Consideracions ètiques

El projecte no implica canvis en l'atenció clínica. Totes les activitats s'emmarquen en assegurament de la qualitat (quality assurance) i avaluació del rendiment.

**Fitxer font:** Phase 1 - main contacts.docx, Project description.docx

---

## Guia de desplegament — Dosense

### Visió general del sistema

Dosense és un sistema de mesurament de dosi i qualitat d'imatge CT desenvolupat per Duke University, dissenyat per a hospitals participants en el programa EuroSafe Imaging. Processa estudis CT rebuts des de fluxos de treball d'imatge hospitalaris i realitza anàlisi automatitzat a nivell d'estudi i sèrie.

Nom intern a Duke: METIS 2. Nom de desplegament per a EuroSafe: Dosense.

### Modalitats de desplegament

Es desplega usant tecnologia de contenidors (Docker, Podman o una altra plataforma de contenidors empresarial adoptada per l'hospital).

**Arquitectura confirmada (després de la Q&A amb Duke): tres components.**

1. **dcm4chee** (contenidor) — receptor DICOM. Escolta en un port DICOM, accepta el C-STORE de les modalitats i escriu els fitxers a l'arbre de directoris esperat. Duke proporciona la imatge.
2. **Dosense** (contenidor) — motor d'anàlisi. Vigila el directori (no escolta a la xarxa), processa els estudis i escriu resultats. Basat en Python 3 sobre imatge Linux stripped-down. Mida: ~2.04 GB (actiu), ~20.5 GB empremta d'imatge virtual.
3. **MongoDB** (extern al contenidor de Dosense) — base de dades. A Duke i MD Anderson està instal·lada directament al hardware, fora de contenidor. Community Edition. Ubicació a HCPB per decidir (hardware vs contenidor propi de MongoDB Community).

> **Nota sobre l'ambigüitat inicial:** en la primera ronda de preguntes Duke va indicar que MongoDB podia anar dins del contenidor amb el directori de dades mapejat al filesystem. En la segona ronda ho van rectificar: la pràctica real a Duke/MD Anderson és MongoDB fora del contenidor, al hardware. Això desacobla MongoDB del pipeline d'anàlisi i encaixa amb la política de disc dedicat per a bases de dades de HCPB.

### Flux funcional

1. La modalitat CT envia l'estudi via C-STORE al receptor DICOM (dcm4chee).
2. dcm4chee escriu els fitxers DICOM al directori vigilat, en la jerarquia Year/Month/Date/Study/Series.
3. Dosense monitoritza aquest directori d'entrada per a estudis CT nous.
4. Tots els fitxers DICOM s'escanegen i les metadades s'emmagatzemen en col·leccions MongoDB.
5. Les sèries CT s'identifiquen i organitzen.
6. Es calcula informació de dosi.
7. S'avalua la qualitat d'imatge CT.
8. Es calcula la dosi d'òrgan.
9. Després de completar el processament, els fitxers DICOM d'entrada s'eliminen per regla per recuperar espai.
10. El sistema està configurat per no retenir informació d'identificació personal (PII).

**Exemple d'estructura de directori (segons Duke):** a Duke el directori arrel és `/data/dicom_storage`, i un estudi del 7 de juliol de 2026 quedaria a `/data/dicom_storage/2026/07/07/...`. Dosense observa `/data/dicom_storage` i tots els seus subdirectoris buscant feina.

### Requisits d'infraestructura

#### Plataforma i dimensionament (referència del proveïdor)

- CPU: Mínim 3 processadors/cores. CPU addicional fortament recomanat (l'anàlisi de qualitat d'imatge escala amb CPU).
- RAM: Mínim 56 GB. Llocs d'alt volum poden requerir més.
- Disc: Planificar ~500 GB per a llocs que processen ~700 estudis CT/setmana.
- Throughput de referència: ~700 estudis/dia amb 9 CPUs i 96 GB RAM. ~2 minuts per sèrie. Escala linealment amb CPU.
- Màxim: Configuracions de 48 CPUs i 512 GB RAM podrien suportar milers d'estudis/dia.
- Duke ha confirmat explícitament que amb el volum de HCPB (200/dia, 1.300/setmana) el sistema "corre bé"; és un volum moderat.

#### Emmagatzematge

- Estudis entrants: Directori top-level com a àrea d'entrada monitoritzada. Jerarquia típica: Year/Month/Date/UniqueStudyName/UniqueSeriesName/dicomImageFiles. Buffer típic de mig dia: ~50 estudis × 1.25 GB = 62.5 GB.
- Logs: Directori dedicat. Logging verbose: ~300 MB/setmana a ~700 estudis/setmana. Rotació automàtica, eliminació a 7 dies.
- MongoDB: ~700-800 MB de creixement/any a ~100 estudis/dia.
- **Sense límit de retenció del buffer d'entrada més enllà de l'espai en disc disponible (confirmat per Duke).** Si el processament s'encalla, el buffer creix fins a omplir el disc: aquest és el risc operatiu número u.

#### Base de dades

- MongoDB versió 6 o superior.
- MongoDB Community Edition és suficient; el pipeline no requereix features d'Enterprise.
- Externa al contenidor de Dosense (vegeu arquitectura). Pot anar en hardware o en un contenidor propi de MongoDB Community.
- Emmagatzema metadades i resultats d'anàlisi en col·leccions dins d'una sola base de dades.
- El directori d'emmagatzematge MongoDB s'ha d'incloure en el procés de backup de l'hospital si es volen conservar resultats històrics.
- **Cicle de vida (EOL, actualitzacions de versió) a càrrec de l'hospital**, no inclòs en els releases trimestrals de Dosense. En ser externa, actualitzar o reiniciar MongoDB no tomba el pipeline d'anàlisi.

### Integració de xarxa i DICOM

- Dosense depèn de fluxos de treball d'imatge hospitalaris que lliuren estudis CT al sistema.
- Entrada pot ser push des de workstation d'adquisició CT o des de router PACS/sistema d'enrutament DICOM.
- A Duke s'usa dcm4chee com a estació receptora DICOM. Duke proporciona una imatge Docker de dcm4chee que actua com a estació DICOM i col·loca els estudis en l'estructura de directoris esperada.
- Les regles d'enrutament són específiques de cada institució.
- Si s'usa host networking, l'hospital ha de revisar polítiques de seguretat i xarxa locals.
- Ports típics a revisar: un port MongoDB (27017 per defecte) i un port DICOM (específic del lloc).
- **L'enfocament de C-STORE multi-destí des de la modalitat (enviar una còpia addicional a la VM de Dosense en paral·lel als destins de producció) és el que fa servir MD Anderson Cancer Center i Duke el valida com a apropiat.**

### Seguretat i maneig de dades

- El sistema NO exporta cap informació d'identificació personal (PII).
- Durant el processament, les capçaleres DICOM s'anonimitzen; només es reté informació no identificable.
- Tot l'anàlisi té lloc dins de la xarxa pròpia de l'hospital.
- No s'espera que hi hagi PHI/PII visible en logs, registres de base de dades o fitxers temporals.
- Duke no requereix accés remot per a suport (assistència inicial via screen-sharing amb IT de l'hospital).
- L'escaneig de vulnerabilitats del contenidor és esperat i suportat. Es poden proporcionar imatges de contenidor refrescades.
- **Sense accés a internet requerit:** el contenidor no necessita sortida a internet en cap moment (ni llicències, ni telemetria, ni actualitzacions automàtiques). Duke i MD Anderson operen completament air-gapped.
- **Sortida de resultats 100% manual:** els resultats són una col·lecció de fitxers CSV que l'hospital revisa i envia manualment al punt de contacte d'EuroSafe (per email) o puja a un Dropbox/Google Drive. No hi ha cap mecanisme automàtic de transferència (ni push des del contenidor, ni pull des de Duke). Conseqüència: **zero regles de firewall sortint** cap a l'exterior des de la VM.

### Operacions i monitorització

- Dosense es pot configurar per a reinici automàtic si el contenidor acaba.
- Risc operacional principal: quedar-se sense espai en disc, especialment al directori de recepció DICOM.
- Els estudis poden arribar fora de seqüència; Dosense espera fins que estan completament rebuts.
- Script de neteja per a estudis parcials orfes en cadència de 24 hores.
- Heartbeat: activitat de timestamp en fitxers de log.
- Gestió de cicle de vida: comandes docker-compose/podman-compose (up -d, stop).
- Releases trimestrals esperats (fora de pedaços per escaneig de seguretat).
- Rollback suportat: es pot romandre fixat en una versió anterior fins a validar una nova release.

### FAQ destacades

- Múltiples escàners alimentant una instància: Sí, suportat.
- Emmagatzematge en xarxa (NAS): Sí, sempre que Dosense hi pugui accedir via filesystem.
- Sense requisits específics d'IOPS.
- Accés i control: determinat per l'hospital (a Duke, limitat a personal METIS 2).
- Mapeig de volums: lliure via docker-compose; cada volum (buffer DICOM, dades MongoDB, logs) es pot mapejar a un disc/punt de muntatge diferent del host.

**Fitxer font:** Dosense_Deployment_Guide_EuroSafe_Imaging.docx + Q&A per email amb Duke (2 rondes, juliol 2026)

---

## Estat del desplegament a HCPB

> Secció específica d'Hospital Clínic de Barcelona. Recull les decisions d'arquitectura, xarxa i operativa preses per IT/DSI a partir del material de Duke i de dues rondes de Q&A per email.

### Paràmetres de dimensionament

- **Volum: ~200 estudis CT/dia, ~1.300/setmana.** Volum moderat segons Duke.
- Referència del proveïdor: 9 vCPU + 96 GB RAM per a ~700 estudis/dia; mínim absolut 3 CPU / 56 GB RAM.
- HCPB (200/dia) està en menys d'un terç del volum de referència alt, per la qual cosa no cal la configuració de gamma alta.

### Especificacions proposades per a la VM

| Recurs | Proposta | Justificació |
|---|---|---|
| vCPU | 6 | Marge sobre el mínim (3); la CPU és el coll d'ampolla real de l'anàlisi d'IQ, escala linealment |
| RAM | 64 GB | Marge sobre el mínim (56 GB) sense demanar recursos que no s'usaran |
| Disc total | 600–750 GB | La referència de 500 GB és per a 700/setmana; HCPB va a 1.300/setmana, gairebé el doble en aquest eix |
| Host OS preferit | SUSE Linux Enterprise Server (SLES) | OS estàndard de HCPB per a hosts de VM |

Plantejament davant recursos virtuals escassos i polítiques estrictes: demanar aquestes specs com a punt de partida escalable, deixant clar que és una VM i que s'amplia amb dades reals si en les primeres setmanes CPU/RAM es queden curts. Monitoritzar ús real de CPU des del dia u.

### Política de discs separats (estàndard HCPB)

La VM es munta amb discs/punts de muntatge separats, mapejats via docker-compose:

- **Sistema** — SO + contenidors.
- **Dades** — buffer d'entrada DICOM (el que escriu dcm4chee a `/data/dicom_storage`). És el que més creix i es buida; el que necessita més marge.
- **BBDD** — volum de dades de MongoDB (extern al contenidor).
- **Logs** — rotació automàtica, eliminació a 7 dies.

### Arquitectura de xarxa i flux DICOM

**Flux del cas real (d'un CT al resultat):**

```
Modalitat CT
   │  C-STORE (DICOM) al port 104 — destí ADDICIONAL en paral·lel
   ▼
dcm4chee (contenidor)  ──escriu fitxers──►  /data/dicom_storage/AAAA/MM/DD/Study/Series
                                                  │  (volum compartit, bind-mount)
                                                  ▼
                                           Dosense (contenidor)  ──llegeix el directori, processa──►
                                                  │
                                                  ▼  connexió de xarxa (27017)
                                           MongoDB (extern)  ── desa resultats anonimitzats
                                                  │
                                                  ▼
                                           Neteja: els DICOM del buffer s'esborren per regla
                                                  │
                                                  ▼
                                           Informe CSV ── revisió + enviament MANUAL a EuroSafe
```

**Enviament des de la modalitat — multi-destí:**
Les modalitats CT de HCPB ja envien a diversos destins DICOM de sèrie (PACS de producció, Qaelum, Syngo.via, etc.). Afegir Dosense és un destí més: es configura un C-STORE addicional apuntant a la IP de la VM de Dosense (port del dcm4chee). **No es toca el routing del PACS de producció** i cada enviament és independent, així que si el receptor de Dosense cau o se satura, el circuit clínic cap al PACS no es veu afectat. Aquest és l'enfocament validat per Duke (el mateix que MD Anderson).

**Comunicació entre contenidors — per disc, no per xarxa:**
Punt clau del disseny. dcm4chee **no envia res per xarxa** a Dosense. Els dos contenidors munten el **mateix volum** del host (bind-mount al disc de "dades", apuntant a `/data/dicom_storage`):
- dcm4chee l'usa com a carpeta de sortida i escriu allà els fitxers DICOM.
- Dosense l'usa com a carpeta d'entrada i la vigila.
El "canal" entre tots dos és el filesystem compartit, no un socket. Es defineix al docker-compose i no consumeix cap port.

**Mapa de ports:**

| Enllaç | Port | Notes |
|---|---|---|
| Modalitat → dcm4chee | 104 (DICOM) | Únic port d'entrada real. La modalitat ataca la IP de la VM aquí. |
| dcm4chee ↔ Dosense | cap | Comparteixen volum. Comunicació per fitxers a `/data/dicom_storage`. |
| Dosense → MongoDB | 27017 | Única connexió de xarxa interna real. Depèn d'on es planti MongoDB. |
| Sortida externa (resultats) | cap | Els CSV surten manualment. Zero regles de firewall sortint. |

Conseqüència pràctica: el disseny de xarxa és molt més simple del que semblava. Un sol port exposat (el 104 del receptor), un enllaç per disc entre els dos contenidors, i la connexió a MongoDB com a únic flec pendent de tancar quan es decideixi la seva ubicació.

**Host networking:** Duke menciona host networking com a requisit del host (juntament amb Docker Engine/Compose, bind-mounted storage i memòria compartida adequada). Implica que el contenidor comparteix la pila de xarxa completa del host en lloc d'aïllar-la, amb implicacions diferents a un mapeig de ports puntual. S'ha de revisar amb l'equip de seguretat de xarxa abans de dissenyar el firewall.

### Seguretat, RGPD i dades al final del projecte

- No s'exporta PII/PHI; capçaleres DICOM anonimitzades durant el processament.
- Les imatges DICOM del buffer s'esborren per regla després de processar-se; no necessiten backup (dada transitòria).
- L'únic que necessita backup és el directori de MongoDB, si es volen conservar resultats històrics.
- Sense sortida a internet; sense accés remot de Duke.
- **Final del pilot:** no queda dada persistent al contenidor de Dosense. Els estudis del buffer ja s'esborren per regla, i cal **eliminar la base de dades MongoDB** (externa, al filesystem). Per part de Duke, els CSV que reben són l'única sortida.
- **Canal de sortida de CSV — flec per al DPO:** pujar agregats (encara que anònims) a Dropbox/Google Drive des de la xarxa de l'hospital és un canal que el DPO pot voler revisar o vetar. Preferible email a EuroSafe (canal controlat) i deixar el Drive com a pla B validat. La part legal/figura de tractament (responsable vs encarregat) la gestiona una àrea jurídica en paral·lel.

### Monitorització recomanada

- Espai en disc del directori d'entrada DICOM (risc operatiu número 1).
- Creixement de MongoDB.
- Heartbeat via timestamp als logs (detectar contenidor penjat).
- Execució correcta de l'script de neteja d'estudis orfes cada 24h.

### Q&A amb Duke — Ronda 1

Preguntes enviades per en Sergi (IT/DSI) a Aiping Ding i Armistead Sapp, amb les respostes de Duke:

1. **MongoDB deployment (dins/fora del contenidor).** Resposta: poden posar MongoDB al contenidor i la base de dades al filesystem de Linux. *(Matisat a la ronda 2: a la pràctica va externa, en hardware.)*
2. **Llicència de MongoDB.** Resposta: usen Community Edition.
3. **Mapeig de volums a discs separats.** Resposta: no hi ha rutes fixes; es pot mapejar on es vulgui amb el docker-compose.
4. **Host OS SUSE (SLES).** Resposta: no ho han validat formalment en SLES. El paquet és basat en contenidors; el host principalment necessita Docker Engine / Docker Compose, bind-mounted storage, host networking i memòria compartida adequada. No esperen dependències a nivell d'aplicació de features específiques d'Ubuntu o RHEL.
5. **Direcció del flux DICOM.** Resposta: Dosense vigila un arbre de directoris; usen dcm4chee per rebre estudis i col·locar-los en l'estructura year/month/day/Study/series amb els fitxers DICOM a nivell de la carpeta de sèries.
6. **Accés a internet.** Resposta: No. A Duke estan air-gapped.
7. **Límit del buffer si el servei cau.** Resposta: sense límit excepte l'espai en disc.
8. **Rollback.** Resposta: sí, es pot romandre en una versió anterior.
9. **Matching XCAT / dependències externes.** Resposta: No; tot corre dins del contenidor.
10. **Cicle de vida de MongoDB.** Resposta (ronda 1): mencionen que hi va haver una versió de MongoDB amb breaking changes i que no ho repetiran. *(Ampliat a la ronda 2.)*

### Q&A amb Duke — Ronda 2 (follow-up)

1. **Dosense és un node DICOM?** Resposta: correcte, no ho és. Vigila un directori del filesystem. Duke pot proporcionar una imatge Docker de dcm4chee que actua com a estació DICOM, escolta i col·loca els estudis en l'estructura de directoris esperada sota el directori arrel conegut (a Duke, `/data/dicom_storage/2026/07/07`, amb Dosense mirant `/data/dicom_storage` i tots els seus subdirectoris).
2. **El receptor ve inclòs?** Resposta: seria un altre contenidor; Duke el proporciona i també està disponible públicament.
3. **C-STORE multi-destí sense tocar el PACS.** Resposta: és l'enfocament usat a MD Anderson Cancer Center (Houston, University of Texas, un dels majors centres oncològics dels EUA).
4. **Dades al final del pilot.** Resposta: no hi haurà dades al contenidor de Dosense. Tots els estudis a `/data/dicom_storage/` s'han d'esborrar per regla després de processar-se, i s'ha d'eliminar la base de dades MongoDB, que serà externa al contenidor de Dosense, al filesystem.
5. **Figura legal de recepció de dades.** *(Gestionat per àrea jurídica en paral·lel; fora de l'abast de la Q&A tècnica.)*
6. **Mecanisme de sortida dels resultats.** Resposta: es podran revisar els informes resumits, que seran una col·lecció de fitxers CSV, i enviar-los per email al punt de contacte d'EuroSafe o pujar-los a un Dropbox o Google Drive.
7. **Accés a internet un cop desplegat (entorn no air-gapped).** Resposta: no es requereix internet; a Duke i MD Anderson estan completament air-gapped.
8. **Cicle de vida de MongoDB.** Resposta: encara estan decidint on posar MongoDB; a Duke i MD Anderson està instal·lada al hardware, no en contenidor. MongoDB Community publica un contenidor Docker que podria ser la millor manera de distribuir-la per poder actualitzar-la segons calgui (en el seu cas, descarregant-la i movent-la a la workstation via USB, pel seu entorn air-gapped).

### Riscos operatius (estat actual)

1. **Espai en disc del buffer d'entrada** — risc núm. 1 segons el proveïdor; sense límit més enllà del disc. Monitoritzar de prop.
2. **Host networking sense definir** — impacte en el disseny del firewall; pendent de revisar amb seguretat de xarxa.
3. **SLES no validat per Duke** — probablement funciona (només requereix Docker Engine/Compose, bind-mounts, host networking), però passar per test abans de producció.
4. **Cicle de vida de MongoDB és de l'hospital** — EOL i actualitzacions no entren als releases de Duke.
5. **Canal de sortida manual (Dropbox/Drive)** — pot xocar amb la política del DPO; preferible email controlat.
6. **[Resolt] Acoblament de MongoDB al pipeline** — en anar MongoDB fora del contenidor, actualitzar-la o reiniciar-la no tomba l'anàlisi.

### Pròxims passos

- Decidir on plantar MongoDB (hardware vs contenidor Community propi) i qui vigila el seu EOL.
- Contactar amb seguretat de xarxa per l'ús de host networking abans de dissenyar el firewall.
- Confirmar amb el DPO el canal de sortida dels CSV (email vs Drive) i l'estat de l'aprovació.
- Sol·licitar a virtualització la VM (6 vCPU / 64 GB / 600–750 GB, 4 discs) com a punt de partida escalable.
- Provar el desplegament dels 3 contenidors sobre SLES en test abans de producció.
- Configurar el 4t destí C-STORE a les modalitats de CT cap a la VM de Dosense.

**Fitxer font:** Q&A per email amb Duke (Aiping Ding, Armistead Sapp), rondes 1 i 2, juliol 2026 + seguiment tècnic intern IT/DSI.

---
## Papers científics

Els 10 papers formen una cadena tècnica que va des de la monitorització automatitzada de dosi, passant per mètriques de qualitat d'imatge, fins al framework complet de monitorització basada en detectabilitat.

---

### Paper 1: Automated Size-Specific CT Dose Monitoring Program: Assessing Variability in CT Dose

- **Autors:** Christianson O, Li X, Frush DP, Samei E
- **Revista:** Medical Physics, 39(11):7131-7139
- **Any:** 2012
- **Categoria:** Monitorització de dosi

#### Context
Més de 62 milions de CT/any als EUA. La dosi CT tradicional (CTDI, DLP) es basa en phantoms de referència i no reflecteix la dosi real al pacient ni és sensible a la seva mida. Existia gran variabilitat de dosi entre institucions sense eines per detectar-la a escala.

#### Objectiu
Desenvolupar un programa automatitzat de monitoratge de dosi CT específic per mida i usar-lo per avaluar variabilitat en dosi entre escàners i institucions.

#### Mètodes
- Servidor dosimètric independent (HIPAA-compliant).
- Software de routing DICOM (COMPASS v2.1.5) aïlla dose report screen captures i scouts.
- OCR tradueix dose reports en text cercable (sèrie, CTDI, DLP, mida de phantom).
- Algoritme de llindar adaptatiu mesura el diàmetre AP/lateral del pacient des de scouts.
- Calcula ED_adj: dosi efectiva ajustada per mida usant k-factors basats en regió anatòmica i mida del pacient.

#### Dades i validació
- 500 scouts per a validació de l'algoritme de mida: diferència mitjana <4% vs. observador, sense diferència significativa (p=0.17).
- 6,351 estudis CT en 1 mes de 3 models d'escàner (GE LightSpeed Pro 16, GE LightSpeed VCT, GE CT750 HD) i 2 institucions.

#### Resultats principals
- L'ajust per mida modifica la dosi efectiva fins a un 44% respecte a estimacions sense ajust.
- Escàners amb reconstrucció iterativa mostren ED_adj significativament menor (rang: 9–64% menys).
- Diferència significativa (fins a 59%) en distribucions d'ED_adj entre institucions, indicant potencial de reducció de dosi.

#### Limitacions
- k-factors definits per a phantom de referència; la correcció per mida és una aproximació.
- No inclou estimació de dosi d'òrgan.

#### Rellevància per al projecte
Primera peça del pipeline automatitzat que va evolucionar fins a METIS/Dosense. Estableix la infraestructura de captura, OCR i anàlisi automatitzat que s'estén en treballs posteriors. Demostra la variabilitat inter-institucional que motiva un programa de monitorització multicèntric com l'actual.

**Fitxer font:** Medical Physics - 2012 - Christianson - Automated size‐specific CT dose monitoring program Assessing variability in CT.pdf

---

### Paper 2: Automated Technique to Measure Noise in Clinical CT Examinations

- **Autors:** Christianson O, Winslow J, Frush DP, Samei E
- **Revista:** AJR (American Journal of Roentgenology), 205(1):W93-W99
- **Any:** 2015
- **Categoria:** Qualitat d'imatge — Soroll

#### Context
Els mètodes existents per avaluar soroll en CT depenien de selecció manual de ROIs o estaven limitats a phantoms, fent impracticable el seu ús a gran escala.

#### Objectiu
Desenvolupar i validar un mètode automatitzat i computacionalment eficient per mesurar el soroll en imatges CT clíniques.

#### Mètodes
Tres passos:
1. Segmentació per tipus de teixit: airejat (<−800 HU), greix (−300 a 0 HU), teixit tou (0–100 HU), os (>300 HU). Anàlisi limitat a teixit tou.
2. Generació de mapa de soroll: SD calculada amb kernel de convolució en cada píxel. Mida òptima: 6 mm (estable entre 6–20 mm).
3. Histograma de SDs → la moda = "global noise level" (pic estret correspon a àrees homogènies; cua a transicions anatòmiques).

Processament: 0.05 s/imatge, 10 imatges/estudi → <1 s total per estudi.

#### Validació
1. Phantom (cadàver de gall dindi — Meleagris gallopavo): 6 dosis, 2 gruixos, 6 kernels. Diferència mitjana vs. tècnica de substracció: 3.4%. Correlació ρ=0.9991, p<0.01.
2. Observadors humans (4 físics, 6 imatges clíniques): Diferència mitjana 4.7% (menor que variabilitat intra-observador de 6.2%). Correlació ρ=0.9979, p=0.001.

#### Aplicació
- 2,358 pacients abdominopelvians en 3 escàners (GE Discovery CT750 HD, GE LightSpeed VCT, Siemens SOMATOM Definition Flash).
- Diàmetre efectiu similar entre escàners (efecte petit, f=0.129).
- SSDE varia 9–33% (efecte moderat, f=0.265).
- Global noise level varia 15–35% (efecte gran, f=0.463).
- Implicació: si s'estandarditza el soroll al nivell del LightSpeed VCT, es podrien reduir dosis un 27% (CT750 HD) i 45% (SOMATOM Flash).

#### Limitacions
- Textura anatòmica de petita escala pot contribuir al global noise level.
- Mesura magnitud però no correlacions espacials (textura) del soroll.
- No mesura resolució ni contrast.

#### Rellevància per al projecte
Proporciona l'input fonamental de soroll automatitzat per al càlcul posterior de d'. La mètrica "global noise level" és exactament la utilitzada en el pipeline de METIS/Dosense.

**Fitxer font:** christianson-et-al-2015-automated-technique-to-measure-noise-in-clinical-ct-examinations.pdf

---
### Paper 3: Patient-Specific Quantification of Image Quality: An Automated Method for Measuring Spatial Resolution in Clinical CT Images

- **Autors:** Sanders J, Hurwitz L, Samei E
- **Revista:** Medical Physics, 43(10):5330-5338
- **Any:** 2016
- **Categoria:** Qualitat d'imatge — Resolució espacial

#### Context
La resolució espacial en CT es caracteritza tradicionalment amb phantoms (inserts en objectes uniformes), però aquests mesuraments no capturen la variabilitat present en imatges clíniques reals. Els escàners moderns amb reconstrucció iterativa i modulació de tub produeixen resolució variable dependent de l'objecte.

#### Objectiu
Desenvolupar i validar una tècnica automatitzada per avaluar les característiques de resolució espacial d'imatges CT clíniques in vivo.

#### Mètodes
1. Segmentació del cos del pacient usant multi-llindar (7 llindars) per crear volum binari.
2. Generació de malla tetraèdrica (iso2mesh) de la superfície del pacient.
3. Mesurament d'ESF (edge-spread function) a les cares exteriors de la malla (interfície pell-aire).
4. Binning radial per distància a l'isocentre per construir ESF sobremostrejada.
5. Diferenciació → LSF → FFT → normalització = Resolution Index (RI) anàleg a MTF.
6. Mètrica de comparació: f_50 (freqüència espacial al 50% del RI).

#### Dades
- 21 datasets clínics (MDCT, Siemens Definition Flash, 120 kV, pitch 0.8, chest i abdominopelvians).
- Mercury Phantom V3.0 per a comparació amb MTF phantom-based.
- 6 kernels investigats (3 FBP + 3 iterativa).

#### Resultats principals
- f_50 augmenta amb kernels més durs per a ambdues reconstruccions (FBP i iterativa), com s'espera.
- L'algoritme detecta la dependència radial del RI (la resolució varia amb la distància a l'isocentre).
- Els mesuraments en pacients són comparables al phantom, però les dades de pacient mostren més dispersió en f_50 — indicant variabilitat clínica no capturada per phantoms.
- Estudi d'observadors confirma que les diferències mesurades són perceptibles visualment.

#### Limitacions
- El mesurament es realitza en interfície d'alt contrast (pell-aire); la resolució per a lesions de baix contrast pot diferir.
- Requereix segmentació adequada del pacient; la taula del CT pot interferir.

#### Rellevància per al projecte
Proporciona l'input de resolució espacial (MTF/RI) patient-specific per al càlcul de d'. Juntament amb el global noise level de Christianson 2015, completa els inputs necessaris per estimar detectabilitat des d'imatges clíniques.

**Fitxer font:** Medical Physics - 2016 - Sanders - Patient‐specific quantification of image quality An automated method for measuring.pdf

---

### Paper 4: Estimating Detectability Index In Vivo: Development and Validation of an Automated Methodology

- **Autors:** Smith TB, Solomon J, Samei E
- **Revista:** Journal of Medical Imaging, 5(3):031403
- **Any:** 2017 (publicat Des 2017, issue Jul-Set 2018)
- **Categoria:** d' — Mètode fonamental

#### Context
Els mètodes existents d'avaluació de qualitat d'imatge CT eren: (1) phantom-based (objectius però no clínicament representatius), (2) preference-based (subjectius, no escalables), (3) observer studies (costosos, laboriosos). Calia un mètode objectiu, patient-specific, automatitzat i escalable.

#### Objectiu
Desenvolupar i validar un mètode per estimar un índex de detectabilitat automàticament des d'imatges CT individuals de pacients (in vivo).

#### Mètodes
- Model observador: NPW (Non-PreWhitening) matched filter en domini de Fourier.
- Inputs: MTF patient-specific (des d'interfície pell-aire, Sanders 2016), global noise level (Christianson 2015), NPS de phantom escalat a variància del pacient (Chen et al., Mercury phantom).
- Funció de tasca: lesió disc 10 mm, contrast −15 HU.
- Fórmula: d'²_NPW = [∬|W|²·MTF² dudv]² / [∬|W|²·MTF²·NPS dudv]

#### Dades de validació
- Estudi previ de Solomon et al.: 21 pacients, lesions hipodenses hepàtiques (5/pacient, 105 total, −15 HU, 12 mm) inserides virtualment en projeccions abans de reconstrucció.
- 6 nivells de dosi (12.5% a 100%), 2 algoritmes (FBP amb B31f, SAFIRE amb I31f força 5).
- 16 lectors (6 radiòlegs + 10 físics), metodologia 2AFC.
- >20,000 trials 2AFC totals.

#### Anàlisi estadístic
- Model lineal generalitzat mixt (probit link, random reader effect).
- Comparació d'accuracy predita vs. observada cohort-based.
- Anàlisi de classificació per algoritme de reconstrucció (linear discriminant).
- Comparació amb models basats només en soroll o només en resolució.

#### Resultats principals
- d'_ind significativament predictiu de detecció de lesions (p<0.05).
- Correlacions Pearson/Spearman entre accuracy predita i observada: >0.84 (totes les dades), R²=0.71.
- FBP sol: Pearson 0.82, R²=0.65. SAFIRE sol: Pearson 0.89, R²=0.75.
- Error de classificació FBP vs. SAFIRE: 35% (comparable al CHO de Solomon: 40%) — d' maneja correctament ambdós algoritmes.
- d'_ind supera el soroll sol com a predictor, especialment per a SAFIRE (R² noise=0.23, R² d'_ind=0.81).
- La resolució sola no és predictiva (p>0.05).

#### Limitacions
- MTF mesurada en alt contrast (pell-aire) pot sobreestimar resolució per a lesions de baix contrast.
- NPS de phantom usat com a aproximació (vàlid per a FBP, aproximació per a iterativa).
- Assumeix shift-invariance i estacionarietat de soroll.

#### Rellevància per al projecte
Pedra angular metodològica del projecte complet. Demostra que d' es pot estimar automàticament des d'imatges clíniques individuals i correlaciona significativament amb la detecció humana real. És la base conceptual del mòdul de qualitat d'imatge de Dosense/METIS.

**Fitxer font:** Estimating detectability index in vivo- development and validation of an automated methodology.pdf

---
### Paper 5: Validation of Algorithmic CT Image Quality Metrics with Preferences of Radiologists

- **Autors:** Cheng Y, Abadi E, Smith TB, Ria F, Meyer M, Marin D, Samei E
- **Revista:** Medical Physics, 46(11):4837-4846 (Editor's Choice)
- **Any:** 2019
- **Categoria:** d' — Validació clínica

#### Context
Les mètriques algorítmiques de qualitat d'imatge desenvolupades en treballs previs necessitaven validació directa contra les preferències i expectatives de radiòlegs clínics. Calia també determinar rangs numèrics "clínicament acceptables" per habilitar monitorització automàtica.

#### Objectiu
Validar mesuraments algorítmics de qualitat (HU d'òrgan, magnitud de soroll, "clarity") contra preferències de radiòlegs, i determinar els rangs acceptables clínicament.

#### Mètodes
- Dataset: 472 sèries CT abdominals (Discovery CT750 HD i SOMATOM Definition Flash), 120 kV, ATCM, FBP/SAFIRE/ASIR/MBIR, 3 institucions.
- Mètriques algorítmiques: HU de fetge (automatitzat), magnitud de soroll (Christianson 2015), clarity (d' normalitzat).
- Estudi d'observadors: 7 radiòlegs rank-ordering + selecció de rang acceptable, via interfície web.

#### Resultats principals
- Acord de rang algorítmic vs. observador (Spearman):
  - Noise magnitude: 0.90
  - Liver parenchyma HU: 0.98
  - Clarity: 1.00
- Llindars clínicament acceptables (mediana):
  - Noise magnitude: 17.8–32.6 HU
  - Liver parenchyma HU: 92.1–131.9
  - Clarity: 0.47–0.52

#### Limitacions
- Només avaluat per a CT abdominal amb contrast.
- Rang acceptable pot variar entre institucions i poblacions.

#### Rellevància per al projecte
Estableix els llindars numèrics validats per radiòlegs que permeten la monitorització automàtica de la qualitat d'imatge. És la base conceptual per als Quality Reference Levels (QRL) i per als criteris de flagging d'outliers en el sistema Dosense.

**Fitxer font:** Medical Physics - 2019 - Cheng - Validation of algorithmic CT image quality metrics with preferences of radiologists.pdf

---

### Paper 6: Correlation of Algorithmic and Visual Assessment of Lesion Detection in Clinical Images

- **Autors:** Cheng Y, Smith TB, Jensen CT, Liu X, Samei E
- **Revista:** Academic Radiology, 27(6):847-855
- **Any:** 2020
- **Categoria:** d' — Validació en casos clínics reals

#### Context
La validació prèvia del d' va usar lesions sintètiques inserides. Calia estendre la validació a casos clínics standard-of-care amb lesions reals per demostrar rellevància clínica.

#### Objectiu
Estendre i validar la metodologia del d' efectiu sobre casos clínics reals de detecció de metàstasis hepàtiques de càncer colorectal.

#### Mètodes
- Dataset: Estudi prospectiu IRB-approved de 51 pacients amb adenocarcinoma colorectal.
- 8 condicions d'imatge per pacient: 4 reconstruccions a dosi estàndard (SD: FBP, A80, AV30, AV60) + 4 a dosi reduïda (RD: Veo 3.0, A80, AV30, AV60).
- 260 lesions hepàtiques no calcificades (233 metastàtiques + 27 benignes), 2–15 mm.
- Mesuraments algorítmics: noise, MTF (d'imatges clíniques), NPS (de phantom sota mateixes condicions).
- d' calculat per a cada mida de lesió en la distribució real de lesions i cada slice de fetge → d' efectiu ponderat.
- 3 radiòlegs certificats van ranquejar les 8 condicions per qualitat perceptual.

#### Resultats principals
- Ranking d' efectiu vs. ranking observador:
  - Perceptual quality: Kendall's Tau 5th percentile = 0.85, Spearman's Rho 5th percentile = 0.94.
  - Lesion detection accuracy: Tau 5th percentile = 0.87, Rho 5th percentile = 0.94.
- d' efectiu supera àmpliament les mètriques individuals:
  - 1/noise: Tau 5th pct = 0.15, Rho 5th pct = 0.16
  - CNR: Tau 5th pct = 0.29, Rho 5th pct = 0.43
  - MTF f_50: Tau 5th pct = 0.29, Rho 5th pct = 0.39
- El ranking de condicions (de pitjor a millor): RD Veo 3.0, RD A80, RD AV30, RD AV60, SD FBP, SD A80, SD AV30, SD AV60.

#### Limitacions
- Configuració de múltiples condicions en un sol pacient (same breath-hold) és ideal per a validació però difícil d'obtenir clínicament.
- Només una tasca clínica (detecció hepàtica).

#### Rellevància per al projecte
Validació definitiva en dades clíniques reals que confirma que el d' efectiu és un reflex robust de la qualitat d'imatge global per a detecció de lesions. Demostra superioritat clara sobre qualsevol mètrica aïllada i justifica el seu ús com a mètrica central de monitorització en Dosense.

**Fitxer font:** Correlation of algorithmic and visual assessment of lesion detection in clinical images.pdf

---
### Paper 7: Patient-Informed Organ Dose Estimation in Clinical CT: Implementation and Effective Dose Assessment in 1048 Clinical Patients

- **Autors:** Fu W, Ria F, Segars WP, Choudhury KR, Wilson JM, Kapadia AJ, Samei E
- **Revista:** AJR (American Journal of Roentgenology), 216(3):824-834
- **Any:** 2021
- **Categoria:** Dosi — Dosi d'òrgan

#### Context
Els registres de dosi CT clínics es basen en outputs de l'escàner (CTDIvol, DLP) que no representen la dosi real als òrgans del pacient. Els mètodes patient-specific requereixen Monte Carlo computacionalment costós. Calia un marc pràctic que usés atributs accessibles del pacient per estimar dosi d'òrgan en temps real.

#### Objectiu
Implementar comprehensivament un marc d'estimació de dosi d'òrgan patient-informed per a monitorització clínica CT, i comparar la dosi efectiva derivada d'òrgans (ED_OD) amb l'estimada per DLP (ED_DLP).

#### Mètodes
- Biblioteca de phantoms XCAT expandida: 58 adults, 56 pediàtrics, 5 embarassades (10 edats gestacionals: 3-38 setmanes), 12 models de referència ICRP.
- Matching automàtic: topograma del pacient → detecció de landmarks anatòmics (DoseWatch, GE) → matching al phantom XCAT amb distribució longitudinal d'òrgans més similar.
- h-factors (CTDIvol → dosi d'òrgan): precalculats per Monte Carlo (PENELOPE) per a cada phantom, protocol i diàmetre. 13 protocols adults + 6 pediàtrics.
- Tube current modulation: modelada via convolució del perfil de corrent amb dose spread function (DSF) simulada per a diàmetres de 8-50 cm.
- Correcció de biaix: model lineal leave-one-out (ODM = β0·ODC + β1 + ε) per a cada protocol, cohort i òrgan. Amb intervals de confiança.
- ED_OD calculada amb tissue weighting coefficients d'ICRP 103.

#### Dades clíniques
- 1,048 pacients (524 dones, 524 homes, edat mitjana 58 anys, rang 18-89).
- 647 exàmens AP amb contrast + 401 chest sense contrast.
- Scanner: Discovery CT750 HD, 120 kV, tube current modulation.

#### Resultats principals
- Precisió del marc:
  - Error màxim de dosi d'òrgan (majoria d'òrgans): 18% sense correcció de biaix, 8% amb correcció.
  - Amb correcció per cohort: adults 9%, embarassades 7%, pediàtrics 8%.
- Comparació ED_OD vs. ED_DLP:
  - Chest: ED_DLP major que ED_OD en mitjana 9.0% (rang -18.1% a +190.9%), p<0.001.
  - AP: ED_DLP major que ED_OD en mitjana 24.3% (rang -28.4% a +234.7%), p<0.001.
  - ED_DLP sobreestima per a pacients grans (WED >25 cm) i subestima per a pacients petits (WED <25 cm).
- Dosi d'òrgan varia substancialment per a un mateix CTDIvol: diferència pulmó-fetge i pulmó-os representen 37-67% del CTDIvol.

#### Limitacions
- Validat només en un escàner.
- XCAT usat tant per crear com per validar el sistema (no validació totalment independent).
- Sense ground truth d'ED en pacients clínics.
- Estudi clínic limitat a adults (sense pediàtrics ni embarassades confirmades).

#### Rellevància per al projecte
Proporciona el mòdul d'estimació de dosi d'òrgan dins de Dosense/METIS. Demostra que les estimacions de dosi basades només en DLP poden diferir massivament de la dosi real, justificant l'enfocament patient-informed del projecte.

**Fitxer font:** CT_organ_dose_estimation_Fu_et_al_2021_AJR.pdf

---

### Paper 8: Patient-Based Performance Assessment for Pediatric Abdominal CT: An Automated Monitoring System Based on Lesion Detectability and Radiation Dose

- **Autors:** Lacy T, Ding A, Minkemeyer V, Frush D, Samei E
- **Revista:** Academic Radiology, 28:217-224
- **Any:** 2021
- **Categoria:** d' — Aplicació clínica pediàtrica

#### Context
El control de qualitat de CT pediàtric depenia de DRLs basats només en dosi. No existia un sistema automatitzat que combinés mètriques de qualitat d'imatge i dosi en població pediàtrica.

#### Objectiu
Desplegar un model automatitzat, escalable i task-specific per avaluar la qualitat d'imatge de CT abdominopelvià pediàtric usant d' i dosi de radiació.

#### Mètodes
- d' calculat combinant MTF (interfície pell-aire, ajustada per edat-distància al fetge), NPS (surrogate de phantom ACR, matched per escàner/kernel/algoritme, escalat per noise del pacient), i funció de tasca (lesió hepàtica 5 mm, 10 HU).
- VRF (visual response function) del sistema visual humà inclosa en la fórmula.
- Dosi extreta via METIS: CTDIvol, DLP, SSDE, diàmetre efectiu.
- Relació edat → distància al fetge: log-lineal (R²=0.80, validada en 49 pacients).
- Processament: ~3 minuts/estudi.

#### Dades
- 507 CT abdominopelvians pediàtrics (0-18 anys), juny 2014 - novembre 2017.
- 3 escàners: Siemens SOMATOM Definition Flash (n=364), GE Discovery CT750 HD (n=53), GE LightSpeed VCT (n=90).
- Protocols pediàtrics codificats per color (pes/edat).
- kV: 80 (n=11), 100 (n=140), 120 (n=213) a Scanner 1; 120 a Scanners 2 i 3.

#### Resultats principals
- CTDIvol: tendència lleugerament positiva amb edat (factor ~1.35× entre grup més jove i més gran).
- SSDE: NO varia significativament amb edat (factor ~1.08×), suggerint que els protocols ajusten adequadament per mida.
- d' varia inversament amb edat:
  - Scanner 1, 100 kV: 0-2 anys = 72, 2-5 = 60, 5-10 = 54, 10-15 = 46, 15-18 = 35.
  - Scanner 1, 120 kV: 0-2 anys = 83, 15-18 = 41.
  - Scanners 2+3, 120 kV: 0-2 = 67, 15-18 = 31.
- Variabilitat entre escàners no explicada per SSDE: d' mediana 53 (Scanner 1, 100 kV) vs 39 (Scanners 2+3, 120 kV) — diferent qualitat amb dosi similar.
- Troballa clínica: la diferència de qualitat entre 120 kV i 100 kV no justificava l'augment de dosi → es van modificar protocols per usar baix kV en edats majors.

#### Limitacions
- Només avaluat en un programa/institució.
- Només una tasca clínica (lesió hepàtica 5 mm).
- No comptabilitza artefactes de moviment, fase de contrast, ni cobertura.
- Només 2 fabricants d'escàner.

#### Rellevància per al projecte
Primera aplicació clínica completa del framework d'+dosi a gran escala. Proposa formalment el concepte de Quality Reference Levels (QRL). Demostra que la combinació de mètriques va informar canvis reals de protocol, validant la utilitat pràctica del sistema que ara es desplega com a Dosense a Europa.

**Fitxer font:** Patient-based performance assessment for pediatric abdominal CT- an automated monitoring system based on lesion detectability and radiation dose.pdf

---
### Paper 9: Development, Validation, and Application of a Generic Image-Based Noise Addition Method for Simulating Reduced Dose CT Images

- **Autors:** Alsaihati N, Solomon J, McCrum E, Samei E
- **Revista:** Medical Physics, 52(1):171-187
- **Any:** 2025 (acceptat Set 2024)
- **Categoria:** Simulació de soroll / Optimització de protocols

#### Context
L'optimització de protocols CT requereix avaluar l'impacte de reduir dosi en la qualitat d'imatge. Les eines basades en projeccions raw són precises però impracticables (dades raw propietàries, difícils d'arxivar). Les eines image-based existents requerien informació de phantom o propietària del vendor.

#### Objectiu
Desenvolupar i validar una eina d'addició de soroll image-based, genèrica (agnòstica al fabricant), que simuli imatges CT a dosi reduïda amb textura de soroll realista, usant només imatges com a input.

#### Mètodes (8 passos)
1. Estimació del Global Noise Index (GNI) per slice (Christianson et al., kernel 9×9).
2. Estimació del NPS de la sèrie completa (kernels 33×33, selecció de ROIs uniformes, ajust de corba analítica Weibull).
3. Forward-projection de les imatges CT per crear sinogrames sintètics.
4. Addició de soroll blanc al sinograma, proporcional als valors d'atenuació.
5. Back-projection del sinograma de soroll.
6. Filtratge del soroll back-projected pel NPS estimat (matching de textura).
7. Escalat segons el nivell de reducció de dosi desitjat.
8. Addició del soroll processat a les imatges originals.

Implementat en Python (CPU/GPU). Simula reducció de mAs (no modela reducció de kV).

#### Validació
- Phantom Mercury 3.0 (multi-mida): Error en magnitud de soroll 3.34%. Diferència en NPS-f_av: 0.07 mm⁻¹.
- Phantom antropomòrfic Lungman: Error 3.50%. Diferència NPS-f_av: 0.06 mm⁻¹.
- Dades de pacients (múltiples dosis/reconstruccions): Error mitjà magnitud de soroll: 4.61%. Textura visualment comparable amb algunes dependències de kernel.

#### Aplicació clínica
Es va usar per avaluar una reducció del 50% de dosi en el protocol de mieloma múltiple de la institució. L'eina va permetre simular com es veurien les imatges a la meitat de dosi sense necessitat de re-escanejar pacients, informant directament el canvi de protocol.

#### Limitacions
- La textura de soroll simulada pot no capturar perfectament artefactes de streaking i no-estacionarietat per a totes les reconstruccions.
- Validació limitada a un nombre acotat de combinacions scanner/protocol.
- No modela reducció de kV.

#### Rellevància per al projecte
Eina complementària al sistema de monitorització: quan un outlier d'alta qualitat s'identifica (d' major a l'esperat), aquesta eina permet avaluar si una reducció de dosi és factible simulant el resultat sense reescanejar. Facilita l'optimització iterativa de protocols.

**Fitxer font:** Medical Physics - 2024 - Alsaihati - Development validation and application of a generic image‐based noise addition.pdf

---

### Paper 10: Beyond Dose Outliers: A Prediction-Interval Framework for Detectability-Based CT Quality Monitoring

- **Autors:** Zhang Y, Ding A, Wells J, Samei E
- **Revista:** Manuscrit en revisió (2026)
- **Categoria:** d' — Framework de monitorització prospectiva

#### Context
La vigilància de qualitat CT existent identifica "outliers de dosi" comparant CTDIvol/DLP amb nivells de referència. Tanmateix, aquests outliers de dosi no distingeixen entre estudis amb qualitat diagnòstica inadequada i estudis amb protocols apropiadament ajustats al pacient. Cal un marc que avaluï directament la detectabilitat tenint en compte tots els factors d'adquisició.

#### Objectiu
Desenvolupar models multivariable de detectabilitat task-based (d') en CT d'adults i usar intervals de predicció per identificar prospectivament outliers de detectabilitat.

#### Dades
- Exàmens de CT d'adults (AP i chest) del Q2 2025.
- 6,726 sèries: 4,192 AP + 2,534 chest.
- 4 instal·lacions: 1 centre mèdic terciari, 2 hospitals comunitaris, centres d'imatge ambulatoris.
- 10 models d'escàner (4 GE HealthCare, 6 Siemens Healthineers).
- Pacients: 3,834 dones, 2,884 homes. Edats: 18-29 (409), 30-49 (1,250), 50-64 (1,852), ≥65 (3,215).
- d' calculat usant plataforma METIS: lesió esfèrica de referència 10 mm, 15 HU; d' resumit com a RSS (root-sum-of-squares) de d' per slice.

#### Mètodes estadístics
- Regressió lineal multivariable de log(d') amb predictors:
  - log(CTDIvol) — dosi
  - WED — mida del pacient
  - Diàmetre de reconstrucció (FOV)
  - kVp (categòric)
  - Gruix de tall reconstruït (categòric)
  - Kernel de reconstrucció (categòric, agrupament d'infreqüents en "OTHER")
  - Model d'escàner (categòric)
  - Instal·lació (categòric)
- Split: 80% training / 20% test (a nivell d'examen per evitar leakage).
- Intervals de predicció bilaterals al 95% per a observacions individuals futures.
- Anàlisi block-wise ΔR² per quantificar contribució relativa de blocs de predictors.

#### Resultats principals
- Rendiment del model:
  - AP: R² = 0.858 (adjusted 0.857), RMSE(log) = 0.1829
  - Chest: R² = 0.921 (adjusted 0.920), RMSE(log) = 0.1825
- Contribució block-wise (ΔR²):
  - Ecosistema d'adquisició (dosi + WED + FOV + kVp): AP 0.575, Chest 0.331
  - Gruix de tall: AP 0.134, Chest 0.079
  - Kernel: AP 0.004, Chest 0.088 (molt més important en tòrax)
  - Scanner model: AP 0.015, Chest 0.017
  - Facility: <0.002
  - Dosi sola (CTDIvol sol): AP 0.155, Chest 0.069 — insuficient per caracteritzar performance
- Outliers identificats:
  - Low-side (baixa qualitat): artefactes metàl·lics severs, FOV de reconstrucció gran, soroll elevat, braços als costats amb streaking, off-centering, manca de MAR (metal artifact reduction).
  - High-side (alta qualitat): detectabilitat major de l'esperada → potencial de reducció de dosi.

#### Implicacions pràctiques
- La revisió sistemàtica d'outliers de baixa qualitat es tradueix en millores operacionals concretes: educació a tecnòlegs sobre MAR, posicionament, centrat.
- Els outliers d'alta qualitat proporcionen punt de partida quantitatiu per a optimització de protocols.
- El marc complementa (no reemplaça) la monitorització de dosi existent.

#### Limitacions
- Estudi unicèntric (un sistema de salut amb protocols relativament harmonitzats).
- d' és task-specific (una definició de tasca; diferents tasques donarien diferents resultats).
- El marc és auto-referenciat (la "normalitat" es defineix per pràctica interna; no detecta biaixos sistemàtics institucionals sense benchmark extern).
- Factors no capturats en predictors: moviment, timing de contrast, off-centering, força de reconstrucció iterativa.

#### Rellevància per al projecte
Aquest és el marc operatiu que es desplegarà en els hospitals europeus participants a través de Dosense. Representa la culminació de la cadena investigativa: els models multivariable de d' amb intervals de predicció són l'eina de vigilància en producció que permetrà a cada hospital identificar estudis amb qualitat diagnòstica inesperadament baixa (per revisió) o alta (per optimització de dosi).

**Fitxer font:** Beyond Dose Outliers- A Prediction-Interval Framework for Detectability-Based CT Quality Monitoring (under review).pdf

---
## Reunions

### Reunió del 15 d'abril de 2026

- **Format:** Videoconferència gravada.
- **Fitxer:** Meetings/15 April 2026 meeting/GMT20260415-145939_Recording_640x360(1).mp4
- **Estat:** Gravació de vídeo (640×360) disponible. No processable automàticament. No es disposa d'acta escrita, transcripció ni notes al workspace.
- **Contingut extret:** Cap (format de vídeo/àudio).

### Reunió del 22 de juny de 2026

- **Format:** Videoconferència gravada (Microsoft Teams — el nom de fitxer indica "Besprechungsaufzeichnung" = gravació de reunió en alemany).
- **Fitxer:** Meetings/22 June 2026 meeting/ESI-Duke CT Performance Monitoring Project Update Meeting-20260622_161054-Besprechungsaufzeichnung.mp4
- **Estat:** Gravació de vídeo disponible. No processable automàticament. No es disposa d'acta escrita, transcripció ni notes al workspace.
- **Contingut extret:** Cap (format de vídeo/àudio).

**Nota:** Per completar la documentació de reunions, caldrien transcripcions d'àudio o actes escrites d'aquestes sessions. La informació de la web de reunions (assistents, temes, decisions, action items) no està disponible al workspace.

---

## Pendents de processar

Els següents fitxers del workspace no es van poder processar automàticament:

- **Meetings/15 April 2026 meeting/GMT20260415-145939_Recording_640x360(1).mp4**
  - Tipus: Vídeo MP4
  - Motiu: Format de vídeo/àudio no processable per eines d'extracció de text.
  - Contingut probable: Gravació de la primera reunió del projecte.

- **Meetings/22 June 2026 meeting/ESI-Duke CT Performance Monitoring Project Update Meeting-20260622_161054-Besprechungsaufzeichnung.mp4**
  - Tipus: Vídeo MP4
  - Motiu: Format de vídeo/àudio no processable per eines d'extracció de text.
  - Contingut probable: Gravació de reunió de seguiment/actualització del projecte.

### Recomanació

Per completar la documentació:
1. Transcriure l'àudio d'ambdues reunions (manualment o amb eines de transcripció automàtica com Whisper, Otter.ai, o la transcripció integrada de MS Teams).
2. Incorporar les transcripcions/actes al workspace per al seu processament i inclusió en aquesta documentació.

---

## Resum de la cadena d'evidència

El projecte se sustenta en una cadena científica coherent desenvolupada al llarg de 14 anys:

1. **Monitorització de dosi automatitzada** (Christianson 2012) → Captura i anàlisi automatitzat de dosi ajustada per mida.
2. **Mètriques de qualitat d'imatge** (Christianson 2015, Sanders 2016) → Soroll i resolució mesurats automàticament des d'imatges clíniques.
3. **Índex de detectabilitat in vivo** (Smith 2017) → Combina inputs en d' patient-specific, validat contra detecció humana.
4. **Validació amb radiòlegs** (Cheng 2019, 2020) → Confirma correlació amb preferències clíniques i determina llindars acceptables.
5. **Estimació de dosi d'òrgan** (Fu 2021) → Dosi patient-informed més precisa que DLP.
6. **Aplicació clínica pediàtrica** (Lacy 2021) → Sistema complet desplegat, va informar canvis de protocol, proposa QRL.
7. **Simulació de dosi reduïda** (Alsaihati 2025) → Eina per avaluar reduccions sense reescanejar.
8. **Framework d'intervals de predicció** (Zhang 2026) → Marc operatiu de vigilància prospectiva amb outlier detection.

Tot convergeix en **Dosense/METIS 2**: el sistema que integra tots aquests mòduls i que ara es desplega en hospitals europeus a través de la col·laboració EuroSafe Imaging.

---

*Document generat a partir de l'extracció i anàlisi de tots els fitxers processables del workspace del projecte ESI-Duke CT Performance Monitoring, actualitzat amb el seguiment tècnic d'IT/DSI d'Hospital Clínic de Barcelona (dues rondes de Q&A amb Duke, juliol 2026).*
