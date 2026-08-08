# 03 · Levelmodell: das eigene Niveau messen statt behaupten

Die zentrale Produktidee. Duolingo zeigt XP; wir zeigen ein Sprachniveau, das
aus tatsächlichen Leistungsdaten berechnet ist, feiner aufgelöst als A1–C2, und
mit einer ehrlichen Antwort auf „werde ich besser?".

---

## Das Problem mit A1–C2

Der Gemeinsame Europäische Referenzrahmen (GER) ist eine Kompetenzbeschreibung,
kein Messinstrument. Er definiert sechs Stufen über „Kann-Beschreibungen" —
und der Europarat selbst hält ausdrücklich fest, dass die Stufen *je nach
lokalem Bedarf weiter unterteilt werden können*. Genau das machen
Sprachschulen seit Jahrzehnten (A1.1, A1.2, …); ein Standard für die Anzahl der
Unterstufen existiert nicht.

Drei praktische Mängel für eine App:

1. **Zu grob.** Von A2 nach B1 vergehen bei realistischem Aufwand Monate. Ein
   Fortschrittsanzeiger, der sich alle vier Monate bewegt, motiviert niemanden
   und informiert auch nicht.
2. **Zu eindimensional.** Fast jeder Lernende hat ein Profil, kein Niveau:
   Lesen B1, Hören A2, Sprechen A1. Eine einzige Zahl mittelt genau die
   Information weg, die man zum Steuern bräuchte.
3. **Nicht selbst messbar.** „Kann in einfachen zusammenhängenden Sätzen über
   vertraute Themen sprechen" lässt sich nicht aus Klickdaten ableiten.

---

## Unser Modell: drei Ebenen

```
   Ebene 3   Gesamtniveau         B1.2            ← eine Zahl, ehrlich gebildet
                                    ▲
   Ebene 2   Fertigkeitsniveaus   Lesen B1.3 · Hören B1.1 · Sprechen A2.4 · Schreiben B1.1
                                    ▲
   Ebene 1   Messgrößen           Wortschatzgröße · Abrufstabilität · Abdeckung
                                  · Reaktionszeit · Aufgabenerfolg nach Schwierigkeit
```

Von unten nach oben: **nur Ebene 1 wird gemessen.** Ebene 2 und 3 sind
Ableitungen. Das ist die entscheidende Eigenschaft — es gibt keinen Punktestand,
den man direkt füttern kann, also gibt es nichts zu optimieren außer der Sprache
selbst (siehe [01](01-duolingo.md), D1).

---

## Ebene 1: Was tatsächlich gemessen wird

| Messgröße | Woher | Warum sie zählt |
| --- | --- | --- |
| **Wortschatzgröße** (geschätzte bekannte Grundformen) | SRS-Bestand, gewichtet nach Stabilität, hochgerechnet über Frequenzrang | Die einzige billig und valide schätzbare Kompetenzgröße ([02](02-evidenz.md), E4) |
| **Formbeherrschung** | Erfolg auf Aufgaben, markiert mit ihrer Paradigmenzelle | Grundform zu kennen heißt nicht, sie beugen zu können — siehe unten |
| **Abrufstabilität** | FSRS-Stabilität pro Karte, aggregiert | Unterscheidet „schon mal gesehen" von „kann ich" |
| **Lexikale Abdeckung** | Anteil bekannter Tokens in Texten des jeweiligen Levels | Der direkte Prädiktor für Leseverstehen |
| **Reaktionszeit bei korrektem Abruf** | Antwortzeit, normalisiert pro Nutzer und Kartentyp | Automatisierungsgrad. Richtig aber langsam ≠ flüssig |
| **Erfolg nach Aufgabenschwierigkeit** | Ergebnisse auf level-etikettierten Aufgaben, IRT-artig ausgewertet | Verankert die Schätzung an geprüften Inhalten statt nur an Selbstläufen |
| **Produktionsqualität** | Fehlerrate und Satzkomplexität in freien Antworten und Diktaten | Die einzige Ebene-1-Größe für Sprechen/Schreiben |

**[D]** Die Gewichtung dieser sechs Größen ist eine Produktentscheidung, keine
Forschungsableitung. Sie gehört in ein Spec, versioniert, mit einem sichtbaren
Änderungsdatum — siehe „Ehrlichkeitsregeln" unten.

### Warum Wortschatzgröße die tragende Größe ist

Weil sie die Brücke zwischen den SRS-Daten und dem Levelbegriff schlägt. Wir
wissen für jede Karte, welchen **Frequenzrang** das Wort in einem
Referenzkorpus hat. Wenn ein Nutzer die Ränge 1–1.200 stabil beherrscht und ab
Rang 2.000 kaum noch etwas, liegt seine Grenze irgendwo dazwischen — und diese
Grenze lässt sich mit gezielten Stichproben aus höheren Rängen präzisieren.
Das ist im Kern ein adaptiver Test, verteilt über den normalen Gebrauch.

Zwei Fallstricke, die wir explizit vermeiden:

- **Nicht LexTALE nachbauen.** Der bekannte Schnelltest (Wort/Nichtwort-Entscheidung)
  ist wegen überschätzter Reliabilität kritisiert worden und trennt L2-Niveaus
  schlechter als behauptet. Adaptives Testen nach Item-Response-Theorie ist der
  bessere Weg und ist genau das, was unsere Frequenzränge ohnehin ermöglichen.
- **Grundform ≠ Wortform.** Wer *gehen* kann, kann nicht automatisch *ginge*.
  Die Schätzung zählt Grundformen, die Übung trainiert Formen — und die Lücke
  dazwischen ist groß genug für eine eigene Messgröße. Siehe „Die zweite Achse"
  gleich unten.

### Die zweite Achse: Formbeherrschung **[D — Korrektur vom 2026-08-08]**

Dieses Modell hatte eine Lücke, auf die der Nutzer gestoßen ist, und sie ist
groß genug für einen eigenen Abschnitt.

**Eine Grundform zu kennen heißt nicht, ihre Formen zu beherrschen.** Im
Italienischen laufen die drei Konjugationsklassen (*parlare · credere ·
dormire*) unterschiedlich, *-ire* spaltet sich nochmal (*dormo* vs. *finisco*),
und die häufigsten Verben sind unregelmäßig (*essere, avere, fare, stare*). Bei
Nomen dasselbe: *-o/-i*, *-a/-e*, dazu *uomo/uomini*, *uovo/uova*, und
Unveränderliches wie *città*.

Die Wortschatzschätzung zählt Grundformen und **unterstellt stillschweigend**,
dass die Formen dazugehören. Das ist bei flektierenden Sprachen falsch, und zwar
pro Wort unterschiedlich stark.

Der Fehler, den das erzeugt, ist derselbe wie in [These 4](README.md), nur eine
Ebene tiefer: Wer 2.000 Grundformen kennt und nicht konjugieren kann, liest gut
und spricht nicht — und bekommt trotzdem quer durch B1 angezeigt.

**Konsequenz:** Formbeherrschung ist eine **eigene Ebene-1-Messgröße**, nicht
Teil der Wortschatzgröße. Gemessen wird sie an **Paradigmenzellen**: Klasse ×
Zeit/Modus × Person, plus die häufigen Unregelmäßigen einzeln. Wer *parlare*
kann und bei *parliamo* scheitert, hat eine Formlücke, keine Vokabellücke.

Zwei Dinge folgen sofort:

1. **Die Form→Lemma-Tabelle muss die Zelle mitspeichern** — `parliamo →
   (parlare, 1. Pl. Präsens)`, nicht nur `parliamo → parlare`. Jetzt kostet das
   nichts; später heißt es, die Tabelle neu zu bauen und jede Historie neu zu
   bewerten. Gleiche Klasse von Entscheidung wie die Zähleinheit
   ([18](18-sprachen-baukasten.md), U1).
2. **Die Formentabellen aus [07](07-offline-papier.md), Ü3 sind keine
   Nebenübung mehr**, sondern das Training einer gemessenen Größe — und ihr
   Mischungsgebot aus [02](02-evidenz.md), E6 bekommt damit ein Ziel.

Nebenbefund: die häufigsten Verben sind die unregelmäßigen. Ganz oben in der
Frequenzliste ist Formbeherrschung also am wichtigsten — genau dort, wo eine
reine Lemmazählung am selbstsichersten aussieht.

---

## Ebene 2: Sublevels

**[D]** Vier Unterstufen pro GER-Stufe, plus Prozentfortschritt innerhalb der
Unterstufe:

```
A1.1  A1.2  A1.3  A1.4  A2.1 … C2.4          24 Stufen gesamt
                                              Anzeige z. B.:  B1.2 · 63 %
```

Warum vier und nicht zwei oder drei: bei realistischem Lernaufwand
(20–30 min/Tag) soll ein Stufenwechsel **etwa alle drei bis sechs Wochen**
passieren. Das ist selten genug, dass er sich verdient anfühlt, und häufig
genug, dass man ihn im laufenden Jahr mehrfach erlebt. Zwei Unterstufen sind zu
grob, sechs entwerten das Ereignis.

Der Prozentwert innerhalb der Stufe liefert die tägliche Rückmeldung — er darf
sich messbar bewegen, und er darf auch **fallen** (siehe Ehrlichkeitsregeln).

### Ungefähre Wortschatzanker **[C]**

Diese Zuordnung ist in der Literatur uneinheitlich und je nach Sprache
verschieden. Sie ist als Kalibrierungs-Startpunkt gedacht, nicht als Wahrheit,
und muss pro Sprache nachjustiert werden.

| Stufe | Wortfamilien (Richtwert) | Was damit realistisch geht |
| --- | --- | --- |
| A1 | ~500–750 | Feste Wendungen, unmittelbarer Bedarf |
| A2 | ~1.000–1.500 | Alltagsroutinen; einfache Hörtexte werden zugänglich |
| B1 | ~2.000–2.750 | ~95 % Abdeckung beim **Hören** wird erreichbar ([02](02-evidenz.md), E4) |
| B2 | ~3.250–4.000 | ~95 % Abdeckung beim **Lesen**; Romane mit Wörterbuch |
| C1 | ~5.000–6.000 | Nahe 98 % beim Hören; beiläufiger Erwerb trägt |
| C2 | ~8.000–9.000 | ~98 % beim Lesen; Wortschatz wächst von selbst weiter |

Die Tabelle erklärt nebenbei ein Produktphänomen: **zwischen B1 und B2 fühlt es
sich an, als passiere nichts.** Der Wortschatz muss sich fast verdoppeln, um die
nächste sichtbare Verstehensschwelle zu überschreiten. Genau dort verlieren
Lernende die Motivation — und genau dort muss die App etwas anzeigen, das sich
trotzdem bewegt (Abdeckung, Stabilität, Lesegeschwindigkeit).

---

## Ebene 3: Das Gesamtlevel

### Der Status einer Fertigkeit — die einzige Stelle, wo das definiert ist

Beim Durchgang über die Studie fiel auf, dass drei Kapitel dieselbe Sache
unterschiedlich beschrieben haben. Sie gehört hierher, und die anderen verweisen
nur noch:

| Status | Wann | Zählt fürs Gesamtlevel? | Anzeige |
| --- | --- | --- | --- |
| **gemessen** | genug Ebene-1-Daten vorhanden | ja | Stufe + Prozent |
| **unsicher** | wenige Daten | ja, mit Band | Stufe ± Spanne, „noch wenige Daten" |
| **nicht gemessen** | Teil des Profils, aber keine Daten — nie gesprochen, oder alle zugehörigen Methoden ausgeblendet ([12](12-methodenkarten.md)) | **nein** | „nicht gemessen", mit dem Weg dorthin |
| **nicht im Profil** | bewusst abgewählt ([14](14-barrierefreiheit.md)) | **nein** | „nicht Teil deines Profils" |

Der Unterschied zwischen den letzten beiden ist keine Wortklauberei: *nicht
gemessen* ist eine Lücke, die sich schließen lässt und deren Weg angezeigt wird;
*nicht im Profil* ist eine Entscheidung, die respektiert und nicht kommentiert
wird. Beide führen aber zum selben Rechenergebnis — sie sind aus der Formel
draußen.

### Die Formel

**[D]** Regel: **das Gesamtniveau ist das zweitniedrigste der Fertigkeitsniveaus,
die zählen.**

Nicht der Durchschnitt (der versteckt eine Lücke), nicht das Minimum (ein
einzelnes ungeübtes Feld drückt alles) und nicht das Maximum (das ist
Selbstbetrug und der Grund, warum Leute im Ausland auf die Nase fallen).

**Sonderfall:** Bleiben nur zwei zählende Fertigkeiten, ist „zweitniedrigste"
gleich „höchste" — und damit zu optimistisch. Ab zwei Fertigkeiten gilt deshalb
das **Minimum**, ab drei die Zweitniedrigste. Bei einer einzigen gibt es kein
Gesamtlevel, sondern nur diese eine Fertigkeit. **⚠ Das ist eine
Produktentscheidung [D] und sie war in der ersten Fassung nicht bedacht;** sie
wurde beim Durchgang gefunden, weil [14](14-barrierefreiheit.md) Profile mit
weniger als vier Fertigkeiten möglich macht.

Dazu ein Satz Klartext neben der Zahl:

> **B1.2** — dein Lesen trägt schon B2, dein Sprechen hängt bei A2.4 hinterher.

Das ist die Anzeige, die man auf der Startseite tatsächlich braucht: eine Zahl
zum Merken und ein Satz, der sagt, was als Nächstes zu tun ist.

---

## „Bin ich besser oder schlechter geworden?"

Vier Vergleiche, in dieser Rangfolge der Prominenz:

### V1 · Ich gegen mich, über Zeit **(Hauptanzeige)**

Ein Verlauf pro Fertigkeit über 30/90/365 Tage. Die zentrale Zahl ist die
**Veränderung**, nicht der Stand: *„Hören: +0,4 Stufen in 90 Tagen"*.
Informational im Sinne von [02](02-evidenz.md), E7 — sie sagt dir, wo du stehst,
und verlangt nichts.

### V2 · Ich gegen mein Ziel

Wenn ein Ziel gesetzt ist (B2 bis Juni, Prüfung im Herbst): die aktuelle
Trendlinie extrapoliert und ehrlich beschriftet — *„bei aktuellem Tempo B2.1 im
August, dein Ziel war Juni"*. Extrapolation nur mit sichtbarem Unsicherheitsband;
eine glatte Prognoselinie ist eine Lüge mit Achsenbeschriftung.

### V3 · Ich gegen den Aufwand

Fortschritt pro investierter Stunde. Die unbequemste und nützlichste Anzeige:
sie deckt auf, wenn jemand viel Zeit in eine unwirksame Übungsart steckt — und
sie ist der eigentliche Hebel, um Lernende von Erkennungs- zu Produktionsübungen
zu bewegen.

### V4 · Ich gegen andere **(optional, standardmäßig aus)** **[D]**

Der Vergleich, nach dem gefragt wird und der am schnellsten schadet. Mogavi et
al. (2022) identifizieren Wettbewerb als einen der Haupttreiber von
Gamification-Missbrauch ([01](01-duolingo.md), D1).

Wenn überhaupt, dann so:
- Bezugsgruppe = Leute mit **ähnlicher Lernzeit und ähnlichem Startpunkt**, nicht
  „alle Nutzer". Sonst vergleicht sich ein Berufstätiger mit Studierenden.
- Als Verteilung, nicht als Rangliste. „Du liegst im mittleren Drittel" statt
  „Platz 12.483".
- Kein Absturzereignis, keine Abstiegszone, keine Wochenfrist.

---

## Ehrlichkeitsregeln

Diese vier Regeln sind der Grund, warum man der Anzeige glauben kann. Sie sind
Kandidaten für [`../CONSTITUTION.md`](../CONSTITUTION.md).

1. **Das Level darf sinken.** Wer drei Monate pausiert, hat weniger stabilen
   Abruf — und bekommt das gesagt. Ein Niveau, das nur steigen kann, ist ein
   Punktestand, kein Messwert. (Konsequenz: das Sinken muss sanft angezeigt
   werden, mit dem Weg zurück daneben — siehe [08](08-motivation.md).)
2. **Unsicherheit wird mitgezeigt.** Am Anfang ist die Schätzung schlecht. Dann
   steht dort „A2 ± 1 Stufe — noch wenige Daten", nicht „A2.3 · 41 %".
3. **Jede Zahl ist aufklappbar.** Ein Tippen zeigt, aus welchen Messgrößen sie
   entstanden ist. Eine Kompetenzzahl ohne Herleitung ist ein Orakel.
4. **Kalibrierung wird datiert.** Wenn wir die Gewichtung ändern, springt das
   Level aller Nutzer. Dann steht im Verlauf ein Marker: *„Berechnung geändert
   am tt.mm.jjjj"* — und die alte Linie bleibt sichtbar. Rückwirkend stille
   Änderung an einer Fortschrittsanzeige ist die schnellste Art, Vertrauen zu
   verlieren.

---

## Was noch offen ist

- **Kalt-Start.** Woher kommt das erste Level? Vorschlag: ein optionaler
  5-Minuten-Adaptivtest, *nach* der ersten Übungseinheit angeboten, nie davor
  ([01](01-duolingo.md), S1). Wer ihn überspringt, startet bei A1.1 mit
  breitem Unsicherheitsband.
- **Sprechen ohne Aufnahme.** Wenn jemand nie ins Mikrofon spricht, gibt es
  keine Ebene-1-Daten für Sprechen. Anzeige dann „nicht gemessen", niemals eine
  geratene Zahl.
- **Mehrere Sprachen** teilen sich einen Nutzer, aber nichts an ihrer
  Kalibrierung. Siehe [11](11-roadmap-offene-fragen.md), Frage 6.
