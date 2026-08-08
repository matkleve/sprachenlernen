# 09 · Feature-Katalog

Alle Ideen an einem Ort, jede mit Evidenzgrad, Aufwand und Urteil. Gedacht zum
Durchgehen und Streichen — die Liste ist bewusst länger als das, was gebaut
wird.

**Spalten:**
`Ev.` = Evidenzgrad **[A]–[D]** ([README](README.md)) ·
`Aufw.` = S / M / L / XL ·
`Urteil` = **V1** (erste Version) · **V2** · **später** · **nein**

---

## A · Karteikarten und Wiederholung → [04](04-karteikarten-srs.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F01 | FSRS-Scheduler mit Stabilität / Schwierigkeit / Abrufwahrscheinlichkeit | A | M | **V1** |
| F02 | „Warum kommt diese Karte jetzt?" — Erklärpanel pro Karte | C | S | **V1** — das Alleinstellungsmerkmal, und billig |
| F03 | Wiederholungshorizont: 30-Tage-Vorschau **mit Ursachenzeile** | C | S | **V1** |
| F04 | Sitzung mit fester Länge statt Rückstandszähler | D | S | **V1** — verhindert den häufigsten Abbruchgrund |
| F05 | Kartentypen gestuft (Erkennung → Bedeutungsabruf → Formabruf) | A | M | **V1** |
| F06 | Hörabruf-Karte für jedes Wort | B | M | **V1** — sonst entsteht ein rein schriftlicher Wortschatz |
| F07 | Mitgelieferte, frequenzsortierte Startdecks pro Sprache | B | M | **V1** — ohne das ist Tag 1 eine Hürde |
| F08 | Wortschatz-Atlas (Frequenzrang × Stabilität) | D | M | **V2** — schönstes Bild der App, aber nicht tragend |
| F09 | Leech-Erkennung mit Diagnose statt mehr Wiederholungen | B | M | **V2** |
| F10 | Zielretention als Nutzerregler (85 % / 90 % / 95 %) | A | S | **V2** — braucht Erklärung, sonst verwirrend |
| F11 | Lückensatz- und Minimalpaar-Karten | A | M | **V2** |
| F12 | Karten aus angetippten Wörtern beim Lesen | B | S | **V1** — koppelt die zwei Säulen |
| F13 | Kollokations-/Chunk-Karten statt Einzelwörter | B | M | **V2** — Sprache besteht aus Wendungen, nicht Wörtern |
| F14 | Zielabhängige Deckauswahl (Reise / Beruf / Prüfung / Lektüre) | C | S | **V2** |
| F15 | Import aus Anki (.apkg) / CSV | D | M | **später** — Nischenpublikum, hoher Supportaufwand |
| F16 | Bildkarten statt Übersetzung (Umgehung der L1) | C | M | **später** — Evidenzlage dünner als der Ruf |

---

## B · Level und Fortschritt → [03](03-level-modell.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F17 | Wortschatzgrößen-Schätzung aus SRS-Daten + Frequenzrang | B | L | **V1** — Fundament für alles Weitere |
| F18 | Vier getrennte Fertigkeitsniveaus | A | M | **V1** |
| F19 | 24 Unterstufen (A1.1 … C2.4) + Prozent innerhalb der Stufe | D | S | **V1** |
| F20 | Gesamtlevel aus den zählenden Fertigkeiten (zweitniedrigste ab drei, Minimum bei zwei), plus erklärender Satz | D | S | **V1** |
| F133 | Paradigmenzelle an jeder Form gespeichert (`parliamo → parlare, 1. Pl. Präs.`) | — | M | **V1** — jetzt kostenlos, später Tabellenneubau plus Neubewertung aller Historie |
| F134 | Formbeherrschung als eigene Ebene-1-Messgröße, getrennt von Wortschatzgröße | D | M | **V2** |
| F135 | Formlücke vs. Vokabellücke unterscheiden und getrennt anzeigen | D | M | **V2** |
| F110 | Fertigkeitsstatus als Zustand: gemessen · unsicher · nicht gemessen · nicht im Profil | D | S | **V1** — ein Besitzer für eine Regel, die sonst in drei Kapiteln auseinanderläuft |
| F21 | Verlaufskurve pro Fertigkeit (30 / 90 / 365 Tage) | D | M | **V1** — beantwortet „werde ich besser?" |
| F22 | Unsicherheitsband bei dünner Datenlage | D | S | **V1** — Voraussetzung dafür, dass man der Zahl glaubt |
| F23 | Aufklappbare Herleitung jeder Zahl | D | M | **V2** |
| F24 | Adaptiver Einstufungstest (IRT), **nach** der ersten Übung angeboten | B | L | **V2** |
| F25 | Zielprognose („bei diesem Tempo B2 im August ± 6 Wochen") | D | M | **V2** — nur mit sichtbarer Unsicherheit |
| F26 | Fortschritt pro investierter Stunde | D | S | **V2** — unbequemste und ehrlichste Anzeige |
| F27 | Kohortenvergleich, opt-in, als Verteilung statt Rangliste | D | M | **später** — Nutzen unklar, Schadenspotenzial belegt |
| F28 | Kalibrierungsmarker im Verlauf bei Berechnungsänderung | D | S | **V2** — Vertrauensfrage |

---

## C · Lesen → [05](05-input-lesen-hoeren.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F29 | Abdeckungsrechner (95–98 % bekannte Wörter pro Nutzer und Text) | A | L | **V1** — das Auswahlprinzip für allen Input |
| F30 | Abdeckungsanzeige vor dem Öffnen („98 % bekannt · 6 min") | D | S | **V1** |
| F31 | Antippen: Wort → Bedeutung im Kontext + Karte anlegen | B | M | **V1** |
| F32 | Antippen: Satz → Übersetzung | C | S | **V1** — deine Ausgangsidee |
| F33 | Antippen: Absatz → Zusammenfassung statt Übersetzung | D | S | **V2** — hilft, ohne die Arbeit abzunehmen |
| F34 | Verzögerungsbremse vor der Übersetzung | B | S | **V1** — ohne sie kein Abrufversuch, ohne Abruf kein Lernen |
| F35 | Vorentlastung: 5 Schlüsselwörter vor dem Text | B | S | **V1** |
| F36 | 2–3 Verständnisfragen nach dem Text | A | M | **V1** — Abrufübung, und Messpunkt fürs Level |
| F37 | Lesegeschwindigkeit messen (WpM) | B | S | **V2** — der einzige Automatisierungsindikator |
| F38 | Thematische Serien (Narrow Reading), 4–6 Texte | B | S | **V2** — reine Sortierregel, große Wirkung |
| F39 | Generierte Texte mit automatischer Frequenz-/Levelprüfung | D | L | **V1** — anders ist Material auf jedem Level nicht finanzierbar |
| F40 | Kuratierte Originaltexte ab B2 | D | XL | **später** — Lizenz- und Redaktionsaufwand |

---

## D · Hören → [05](05-input-lesen-hoeren.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F41 | Audio + synchronisiertes Transkript (Reading-while-listening) | B | L | **V1** |
| F42 | Drei Sichtbarkeitsstufen (nur Audio / Captions / + Übersetzung) | B | M | **V1** |
| F43 | Protokollieren, auf welcher Stufe gehört wurde | D | S | **V1** — sonst misst das Level Lesen und nennt es Hören |
| F44 | Sprachbefehle: wiederhole · übersetze · langsamer · merken | C | L | **V1** — deine Kernidee; ermöglicht Lernen ohne Bildschirm |
| F45 | Dieselben Befehle als Tasten, auch im Sperrbildschirm | D | M | **V1** — Sprache ist im Bus unbrauchbar |
| F46 | Tempoänderung ohne Tonhöhenverzerrung | D | S | **V1** |
| F47 | „Wiederhole"-Häufungen → Kandidatenkarten | D | M | **V2** — Verhaltenssignal für Nicht-Verstehen |
| F48 | Rücksprungdichte kalibriert die Schwierigkeitsschätzung nach | D | M | **später** |
| F49 | Eigene Hörbücher/Podcasts einspielen (Transkript per ASR) | D | XL | **später** — rechtlich und technisch der teuerste Punkt |
| F50 | Audio-Karteikarten, vollständig blind bedienbar | C | M | **V2** |

---

## E · Produktion → [06](06-produktion.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F51 | LLM-Gesprächspartner, Text | B | M | **V2** |
| F52 | Korrekturregler (fließen lassen / sanft / streng) | B | M | **V2** — ohne ihn verfestigt der Partner Fehler |
| F53 | Nachbesprechung mit Fehlerkategorien → Karten | B | M | **V2** |
| F54 | „Umschifft"-Analyse (was hast du vermieden?) | D | L | **später** — beste Idee der Studie, teuerste Umsetzung |
| F55 | 60-Sekunden-Anleitung zum Umgang mit dem KI-Partner | B | S | **V2** |
| F56 | Sprachversion des Gesprächspartners | B | L | **später** |
| F57 | Aussprache: Konfidenzband statt ✓/✗ | B | M | **V2** |
| F58 | Aussprache: Selbstvergleich (eigene Aufnahme ↔ Muttersprachler) | C | S | **V2** — billigste wirksame Aussprachefunktion |
| F59 | Lautspezifisches Feedback für bekannte Problemlaute des Sprachpaars | B | L | **später** |
| F60 | Schreiben: Satz mit Zielwort bilden (im SRS) | A | S | **V1** — Produktionsabruf, minimaler Aufwand |
| F61 | Schreiben: Tagebuch, 3 Sätze, mit Korrektur-Diff | B | M | **V2** |
| F62 | Schreiben: Rückübersetzung mit Musterlösungsvergleich | B | M | **V2** — bestes Format gegen Vermeidung |
| F63 | Korrekturen nach Kategorie zählen → Fehlerarten-Verlauf | D | M | **V2** |

---

## F · Offline und Papier → [07](07-offline-papier.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F64 | Diktat aus dem eigenen Kartenbestand generiert, dreifach vorgelesen | B | M | **V2** |
| F65 | Selbstkorrektur-Abgleich → Fehler werden Karten | D | M | **V2** |
| F66 | Druckbares Handschriftblatt (20 wackligste Karten) | B | S | **V2** |
| F67 | Formentabellen (Konjugation, Deklination, Steigerung), **gemischt** | A | M | **V2** — deine Idee; Mischung ist der Wirkfaktor |
| F68 | Dictogloss ab B1 | B | M | **später** |
| F69 | Foto-Erkennung handschriftlicher Antworten | D | XL | **nein für V1/V2** — hängt die Idee an eine Technik, die sie nicht braucht |
| F70 | Gesprächskarten für echte Tandempartner | D | S | **später** |
| F71 | Vorbereitungsblatt für einen konkreten Anlass (Arzt, Amt, Bewerbung) | D | M | **später** |
| F72 | Nachbereitung: „Was konntest du nicht sagen?" → Karten | D | S | **V2** — beste Kartenquelle überhaupt |

---

## G · Motivation und Rahmen → [08](08-motivation.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F73 | Kurze Einheit mit sichtbarem Ende | A | S | **V1** |
| F74 | Benachrichtigung mit Inhalt („12 Karten kippen heute · 6 min") | D | S | **V1** |
| F75 | Wochen-Streak (≥3 Lerntage), unter dem Level, ohne Kaufangebot | D | S | **V2** |
| F76 | Wochenrückblick als Erzählung mit Kausalsatz | D | M | **V2** |
| F77 | Kompetenzmoment: alten, zu schweren Inhalt erneut anbieten | D | M | **V2** — stärkster echter Motivator, billig zu bauen |
| F78 | Pausenmodus ohne Strafe | D | S | **V1** |
| F79 | Lernziel abfragen und **tatsächlich** auf Inhalte wirken lassen | B | M | **V2** |
| F80 | Ligen, Herzen, XP, kaufbarer Streak-Schutz | — | — | **nein** — siehe [10](10-antipatterns.md) |

---

## I · Methodenwahl → [12](12-methodenkarten.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F87 | Methodenkatalog: jede Methode mit Zielfertigkeit, **Zielsignal**, Intensität, Dauervarianten, Setting | D | M | **V2** — ohne Zielsignal ist Wirkung nicht messbar |
| F88 | Methodenkarte mit Intensität, Dauer, „trainiert vor allem" | D | S | **V2** — deine Idee |
| F89 | Tagesmenü: genau 3 Karten, nach Budget und Setting gefiltert | B | M | **V2** |
| F90 | Budget-/Energiefilter („5 / 15 / 30 min · müde / geht / wach") | C | S | **V2** — ehrlicher als ein Tagesziel |
| F91 | Daumen hoch/runter **plus** eine diagnostische Rückfrage | D | S | **V2** — der blanke Daumen ist fast wertlos |
| F92 | Grundfrequenz pro Methode, mit Begründung und „kürzer statt seltener" | D | M | **V2** — dein „einmal die Woche"; hält das System stabil |
| F93 | Deckel: max. **eine** Grundfrequenz-Aufforderung pro Tag | D | S | **V2** |
| F94 | Wirkungsschätzung je Methode und Signal, mit Populationsstart und Unsicherheit | D | L | **später** — statistisch schwer, siehe [12](12-methodenkarten.md) |
| F95 | Erkundungsanteil (10–20 % ungewählte Methoden im Menü) | D | S | **später** — ohne ihn ist die Schätzung eine sich selbst bestätigende Schleife |
| F96 | Vorliebe und Wirkung getrennt gespeichert, nie zu einem Wert verrechnet | D | S | **V2** — sobald sie verschmelzen, ist die Unterscheidung unwiederbringlich weg |

## J · Hörwahrnehmung → [13](13-aussprache-hoerwahrnehmung.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F97 | Kontrastliste pro Sprachpaar als Datenbestand | A | M | **V2** |
| F98 | HVPT-Training: Zweiwahl, sofortiges Feedback, **viele Sprecher** | A | M | **V2** — beste Evidenz/Aufwand-Bilanz der ganzen Studie |
| F99 | Kontrast-Screening: welche Kategorien fehlen diesem Nutzer? | A | S | **V2** — die einzige belastbare Aussprachediagnose hier |
| F100 | Gelöste Kontraste als Ebene-1-Signal fürs Hörlevel | D | S | **V2** — echte Fähigkeitsschwelle statt Häufigkeitsstatistik |
| F101 | Sprecherpool mit erzwungener Mindestanzahl | A | M | **V2** — zu wenige Sprecher sehen aus wie HVPT und wirken nicht |

## K · Barrierefreiheit → [14](14-barrierefreiheit.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F102 | Konfigurierbares Fertigkeitsprofil; Gesamtlevel nur aus den gewählten | D | M | **V1** — sonst rechnet das Levelmodell für manche Nutzer dauerhaft falsch |
| F103 | Karten mündlich oder per Auswahl beantwortbar, gleichwertig gezählt | B | M | **V1** — sonst misst die App Rechtschreibung und nennt es Wortschatz |
| F104 | Audio zu **jedem** Text, nicht nur zu Hörinhalten | B | M | **V2** |
| F105 | Typografie einstellbar (Schrift, Zeilenabstand, Zeilenlänge, Hintergrund) | C | S | **V2** |
| F106 | Textliche Entsprechung für Verlaufskurve und Wortschatz-Atlas | — | S | **V2** — sonst ist die Kerninformation rein visuell |
| F107 | Spec-Pflicht: jede fertigkeitsgebundene Aufgabe benennt ihren Alternativweg | — | S | **V1** — Prozessregel, billig jetzt, sehr teuer später |

## L · Chunks und Wendungen → [16](16-weitere-befunde.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F108 | Antippen erkennt feste Wendung und bietet die ganze an | B | M | **V2** |
| F109 | Wendungen zählen in der Wortschatzschätzung nicht wie n Wörter | — | M | **V2** — ⚠ offene Modellierungsfrage, gehört zu Frage 4 |

## M · Eigene Inhalte → [17](17-eigene-inhalte.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F111 | Eigene Audioquellen: RSS, Datei, Link — **kein Katalog** | D | M | **V2** |
| F112 | Abdeckung über ein **gleitendes Fenster** → Abschnitt statt Folge vorschlagen | D | M | **V2** — billigste Antwort auf „Podcasts sind zu schwer" |
| F113 | Partial Dictation über das Transkript, Lücken **gezielt** gesetzt | B | M | **V2** — ersetzt „Text korrigieren", wofür es keine Evidenz gibt |
| F114 | Stützleiter statt Vereinfachung (Stufe 0–4, niedrigste passende) | B | M | **V2** |
| F115 | Zielgerichtete Vereinfachung: nur die Wörter, die *dieser* Nutzer nicht kennt | D | M | **später** |
| F116 | Textupload, lokal verarbeitet, Verarbeitungsort sichtbar | — | M | **V2** |
| F117 | Serien-Vorschlag (Narrow Listening) aus den eigenen Quellen | B | S | **V2** |
| F118 | Stützenabbau-Leiter über mehrere Durchgänge desselben Stücks | B | S | **V2** |
| F119 | ASR-Transkript, wenn keins mitgeliefert wird | — | L | **später** — ohne Transkript ist ein Audio für uns unbenutzbar |

## N · Sprachen-Baukasten → [18](18-sprachen-baukasten.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F120 | Sprachprofil als validiertes Schema (Schrift, Morphologie, **Zähleinheit**, Quellen) | — | M | **V1** — ohne Zähleinheit rechnet das Levelmodell still falsch |
| F121 | Paar-Profil (Kontrastliste, Übersetzungsqualität) | — | S | **V2** |
| F122 | Lemmatisierung über Stanza/UD statt handgeschriebener Regeln | — | M | **V1** — ~70 Sprachen ohne eigene Linguistik |
| F123 | Qualitätsstufe A/B/C, **abgeleitet** aus dem Profil, nie handgesetzt | D | S | **V2** |
| F124 | Bootstrap einer neuen Sprache: Liste + Lemmatisierer → Stufe C, generiertes Deck → Stufe B | D | L | **V2** |
| F125 | Auf Stufe C kein Levelwert, sondern Status „nicht gemessen" | D | S | **V2** |

## O · Meilensteine und Karte → [19](19-meilensteine-und-karte.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F126 | Frequenzblöcke mit **marginalem** Ertrag, pro Sprache kalibriert | A | M | **V2** |
| F127 | Blockfortschritt zählt **stabiles** Wissen, nicht gesehene Karten | A | S | **V2** — sonst ist es eine Aktivitätsmetrik (A1) |
| F128 | Ehrliche Vorwarnung: „der nächste Block bringt nur noch +4" | D | S | **V2** |
| F129 | **K3 · Was fehlt mir zu diesem Inhalt?** — Abdeckungsrechner rückwärts | D | M | **V2** — stärkste Einzelidee: man lernt nicht Vokabeln, man schließt eine Folge auf |
| F130 | K2 · Was ist diesen Monat aus „anstrengend" in „angenehm" gewandert | D | M | **V2** |
| F131 | Wort rückverfolgbar: wo kommt es in meinen Inhalten vor, welcher Rang, welcher Block | D | M | **später** |
| F132 | Historische Abdeckung mit Zeitstempel **und** damaliger Kalibrierung | — | M | **V2** — sonst zeigt eine Neukalibrierung Fortschritt, den es nicht gab |

## P · Sprechen ohne KI → [20](20-sprechen-und-saetze.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F136 | **4/3/2**: dieselbe Geschichte in 4, dann 3, dann 2 Minuten | B | S | **V2** — beste Aufwand-Wirkung-Bilanz der ganzen Studie; Timer und Mikrofon genügen |
| F137 | Die drei eigenen Aufnahmen direkt hintereinander anhören | C | S | **V2** — ersetzt den fehlenden Zuhörer und ist ein Kompetenzmoment |
| F138 | Sichtbare Planungsphase vor jeder Sprechaufgabe | B | S | **V2** |
| F139 | Shadowing über vorhandenes Audio + Transkript | B | M | **V2** — komplementär zu HVPT, nicht austauschbar |
| F140 | Sprechaufgaben mit **Ergebnis** statt mit Thema (TBLT) | B | M | **V2** |

## Q · Infoseite und Methoden jenseits der App → [12](12-methodenkarten.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F141 | Infoseite je Methode: was · warum · **wie sicher [A]–[D]** · Grenzen · Abwandlungen · Bedarf | B | M | **V2** — deine Idee |
| F142 | Abschnitt „was es *nicht* leistet" ist **Pflichtfeld** | D | S | **V2** — sonst ist die Seite Werbung |
| F143 | Methoden, die die App nicht durchführt (Theater, Tandem, Kochen, Tagebuch) im selben Katalog | D | M | **V2** — These 9 |
| F144 | Für diese: Vorbereitung + Nachbereitung, aber **keine** Wirkungsschätzung | D | M | **V2** |
| F145 | Ihre Stellung im Menü kommt aus der **Grundfrequenz**, nicht aus Messung | D | S | **V2** — sonst verdrängt Messbares das Zählende |
| F146 | Selbstberichtete Erledigung als selbstberichtet markiert, fließt nicht in Ebene 1 | D | S | **V2** |

## R · Katalog und Kontext → [21](21-methodenkatalog-und-kontext.md)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F147 | Methodenkatalog als **Daten** — eine Methode hinzufügen ist ein Eintrag, kein Release | — | M | **V2** — sonst bleibt der Katalog bei zehn Einträgen stehen |
| F148 | Kontextmodell: acht Dimensionen (Augen, Hände, Stimme, Fläche, Ton, Aufmerksamkeit, Zeit, Gesellschaft) | D | M | **V2** |
| F149 | Benannte Kontext-Voreinstellungen, bearbeitbar, eigene anlegbar | D | S | **V2** |
| F150 | **Kontext filtert zuerst** — vor Grundfrequenz, Wirkung, Vorliebe | D | S | **V2** — korrigiert die Menüreihenfolge aus [12](12-methodenkarten.md) |
| F151 | Kontext wird **angetippt**, nie erschnüffelt (kein Standort, keine Sensoren) | — | S | **V2** — [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 |
| F152 | Harte Methoden als solche angeschrieben statt versteckt | D | S | **V2** |
| F153 | Schwach belegte Methoden bleiben im Katalog, mit ehrlicher Marke | D | S | **V2** |
| F154 | Langfenster-Modus: eigene Sequenz statt 24× die Fünf-Minuten-Einheit | A | M | **V2** — massiertes Wiederholen ist genau das, was E2 verbietet |
| F155 | Katalog-Lücke benennen, wenn zum Kontext nichts passt | D | S | **später** |
| F156 | Filter fragt **vier** Kriterien (Zeit, Augen, Stimme, Schreibfläche), nicht acht | D | S | **V2** |
| F157 | Favoritenliste als explizite Oberfläche fürs Konto *Vorliebe* | D | S | **V2** |
| F158 | Wirkungsdaten bleiben **lokal**; Aggregation über Menschen ist eine eigene Entscheidung | — | M | **V2** — [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 |

## H · Grundlagen (unsichtbar, aber tragend)

| # | Funktion | Ev. | Aufw. | Urteil |
| --- | --- | --- | --- | --- |
| F81 | Frequenzlisten + Lemmatisierung pro Sprache | — | L | **V1** — ohne das funktioniert weder F17 noch F29 |
| F82 | Offline-Fähigkeit für SRS und heruntergeladenes Audio | — | L | **V2** — Pendeln ist die häufigste Lernsituation |
| F83 | Datenexport (alle Karten, alle Historie) | — | S | **V1** — [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 |
| F84 | Mehrere Zielsprachen pro Konto | — | M | **V2** |
| F85 | Meldeweg für falsche generierte Inhalte | — | S | **V1** — Qualitätspflicht bei generiertem Material |
| F86 | Wirksamkeitsmessung eingebaut (Vortest, Kohorten, auch Abbrecher) | — | L | **V2** — sonst wiederholen wir [01](01-duolingo.md), S5 |

---

## Der V1-Schnitt in einem Satz

**Karteikarten mit sichtbarem Zeitplan, ein aus Kartendaten berechnetes
Levelprofil, und Lese- sowie Hörinhalte, die nach berechneter Abdeckung
ausgewählt werden.** Alles andere ist Erweiterung.

Die Reihenfolge und die Begründung des Schnitts stehen in
[11](11-roadmap-offene-fragen.md).
