# 18 · Der Sprachen-Baukasten: jede Sprache, ehrlich abgestuft

Deine Frage: *„Wie unterscheidet es sich so stark, ob ich Spanisch, Italienisch,
Norwegisch oder Deutsch lerne? Das soll einfach festgelegt werden und dann machen
sich automatische Übersetzer / AI dran, den Kurs aufzusetzen. Keine Ahnung,
vielleicht träume ich."*

**Du träumst nicht.** Die Antwort ist zu ungefähr 80 % ja, und die restlichen
20 % sind sehr konkret benennbar. Ich hatte in Frage 2 den Eindruck erweckt,
Sprachen seien pauschal teuer — das war zu grob, und dieses Kapitel korrigiert
es.

---

## Die entscheidende Trennung: Code oder Daten?

Fast alles, was diese App ausmacht, ist **sprachunabhängiger Code**:

| Sprachunabhängig (einmal gebaut) | Pro Sprache nötig (Daten, nicht Code) |
| --- | --- |
| Scheduler, FSRS, Aufgabenmodell ([ADR-0004](../adr/0004-word-task-data-model.md)) | Frequenzliste |
| Abdeckungsrechner, Levelmodell, Fertigkeitsstatus | Lemmatisierer-Modell |
| Methodenmotor, Grundfrequenzen, Tagesmenü | GER-Kalibrierung |
| Wiederholungshorizont, Atlas, Meilensteinkarte | TTS-Stimme(n) |
| Diktat, Partial Dictation, Leseoberfläche, Hörer | Startdecks |
| Gesamte Oberfläche | — |
| | **Pro Sprach*paar*:** Kontrastliste (HVPT), Übersetzungsqualität |

Das ist die gute Nachricht: **ein Sprachprofil ist eine Datendatei, kein
Modul.** Eine neue Sprache anzulegen heißt, sechs Felder zu füllen — nicht, die
App zu erweitern.

---

## Was die Werkzeuglage tatsächlich hergibt

Ich hatte Lemmatisierung als teuer beschrieben. Das stimmt so nicht mehr:

**Stanza** (Stanford NLP) deckt über **70 Sprachen** mit einheitlicher
Architektur nach dem Universal-Dependencies-Schema ab — Tokenisierung,
Mehrwort-Token-Expansion, POS- und Morphologie-Tagging, Lemmatisierung. In
Vergleichen über 100 UD-Treebanks in 66 Sprachen schneidet es durchgehend besser
oder gleich gut ab wie UDPipe und spaCy, dessen Mehrsprachigkeit deutlich
begrenzter und über Sprachfamilien hinweg uneinheitlich ist.

Frequenzlisten gibt es aus offenen Korpora (Untertitel, Wikipedia) für die
meisten dieser Sprachen. Brauchbare TTS ebenfalls.

**Also:** für rund 70 Sprachen ist die Grundausstattung beschaffbar, ohne dass
jemand Linguistik betreibt. Das ist der Teil deines Traums, der einfach stimmt.

---

## Wo es wirklich unterschiedlich wird — und warum

Nicht alle Sprachen sind gleich teuer, aber die Trennlinie liegt woanders, als
man vermutet. **Norwegisch ist morphologisch einfacher als Spanisch.** Deine
Intuition ist für europäische Sprachen richtig; sie bricht bei genau vier
Eigenschaften:

### U1 · Was zählt als „ein Wort"? **— der teuerste Unterschied**

Das ganze Levelmodell hängt an „bekannte Wörter, gezählt gegen Frequenzrang"
([03](03-level-modell.md)). Diese Größe bedeutet nicht in jeder Sprache dasselbe:

| | Beispiel | Folge |
| --- | --- | --- |
| **Flektierend** | Spanisch, Italienisch, Deutsch | ~50 Verbformen pro Lemma. Lemma-Zählung funktioniert |
| **Schwach flektierend** | Norwegisch, Englisch, Niederländisch | Am einfachsten. Formen ≈ Lemmata |
| **Agglutinierend** | Finnisch, Türkisch, Ungarisch | Tausende Formen pro Lemma. „Wortschatzgröße" ist ein **anderer Begriff** — die GER-Anker aus [03](03-level-modell.md) übertragen sich nicht |
| **Isolierend + Segmentierung** | Chinesisch, Japanisch, Thai | **Keine Wortgrenzen im Text.** Tokenisierung ist selbst ein Modell, und der Abdeckungsrechner hängt davon ab |

Das ist der Punkt, an dem „einfach festlegen und die KI macht den Rest"
tatsächlich scheitert — nicht am Aufwand, sondern daran, dass die **Messgröße
ihre Bedeutung ändert**. Ein Finnisch-Lernender mit „2.000 Wörtern" steht nicht
dort, wo ein Spanisch-Lernender mit 2.000 steht.

### U2 · Schrift

Kyrillisch, Griechisch, Arabisch, Hebräisch, CJK, Devanagari. Das betrifft
Karteneingabe (Tastatur), Handschriftübungen ([07](07-offline-papier.md), wo die
Evidenz genau hier am stärksten ist), Typografie und — bei Arabisch und Hebräisch
— dass die Vokale im Normaltext **gar nicht stehen**.

### U3 · Lautsystem gegenüber der Ausgangssprache

Die HVPT-Kontrastliste ([13](13-aussprache-hoerwahrnehmung.md)) ist **pro Paar**,
nicht pro Sprache. Deutsch → Spanisch hat wenige harte Kontraste; Deutsch →
Chinesisch hat Töne, also ein Merkmal, das im Deutschen keine Bedeutung trägt.
Der Aufwand wächst mit der Zahl der Paare, nicht der Sprachen.

### U4 · Übersetzungsqualität

Maschinelle Übersetzung Deutsch ↔ Spanisch ist ausgezeichnet. Deutsch ↔
Isländisch oder Georgisch deutlich schlechter. Da die Übersetzung die
*Bedeutungsseite jeder Karte* ist, schlägt schlechte MT direkt auf die
Lernqualität durch.

---

## Das Sprachprofil **[D]**

Eine deklarative Datei pro Sprache. Keine davon enthält Code:

```
  sprache            it
  schrift            latein
  morphologie        flektierend
  zaehleinheit       lemma            ← was "ein Wort" hier bedeutet (U1)
  frequenzliste      quelle + version
  lemmatisierer      stanza:it
  ger-kalibrierung   anker pro stufe, datiert   ← [03], Ehrlichkeitsregel 4
  tts                stimmen-ids
  qualitaetsstufe    A
```

Plus eine Datei pro **Paar** (de→it) für Kontrastliste und Übersetzungsqualität.

---

## Die Qualitätsstufe — und warum sie sichtbar sein muss

Hier ist der kritische Teil deiner Idee. „Die KI setzt den Kurs auf" ist genau
das, was [01](01-duolingo.md), D6 beschreibt und was
[10](10-antipatterns.md), A5 verbietet — mit einem Argument, das sich nicht
wegdiskutieren lässt: **der Lernende kann nicht beurteilen, ob der Satz in der
Zielsprache richtig ist. Das ist der Grund, warum er lernt.** Ein falscher Satz
wird mit derselben Sorgfalt eingeprägt wie ein richtiger.

Für ein **Werkzeug für dich** (Frage 1) ist das ein Risiko, das du wissentlich
eingehen darfst. Als Produktversprechen ist es keins. Der Ausweg ist nicht,
darauf zu verzichten, sondern es **anzuschreiben**:

| Stufe | Was vorliegt | Was die App zeigt |
| --- | --- | --- |
| **A** | Frequenzliste + Lemmatisierer + kalibrierte Anker + geprüfte Startdecks + Kontrastliste | Alles. Level mit normaler Unsicherheit |
| **B** | Frequenzliste + Lemmatisierer, Anker **geschätzt**, Inhalte generiert und ungeprüft | Alles, aber Level mit **breiterem Band**, Inhalte als generiert gekennzeichnet |
| **C** | Nur Frequenzliste, keine verlässliche Lemmatisierung | Karten und Input ja. **Kein Levelwert** — Fertigkeitsstatus „nicht gemessen" ([03](03-level-modell.md)) |

Stufe C ist der ehrliche Umgang mit U1: wo wir nicht sagen können, was ein Wort
ist, können wir keine Wortschatzgröße behaupten. Die App funktioniert trotzdem —
sie behauptet nur weniger.

**Das ist die Antwort auf deine Frage.** Jede Sprache: ja. Jede Sprache mit
derselben Aussagekraft: nein, und das anzuzeigen ist ehrlicher, als es zu
verstecken.

---

## Der Bootstrap-Ablauf für eine neue Sprache

1. Profil anlegen, Frequenzliste und Lemmatisierer beschaffen → Stufe C steht.
2. Startdeck aus den obersten Frequenzrängen generieren, Übersetzungen per MT,
   TTS-Audio → Stufe B, Level mit breitem Band.
3. Anker kalibrieren, sobald genug eigene Daten da sind; Stichproben prüfen
   lassen; Kontrastliste für das Paar erstellen → Stufe A.

Schritt 1 und 2 sind automatisierbar — **das ist dein Traum, und er
funktioniert.** Schritt 3 ist Arbeit, und er ist der Unterschied zwischen
„benutzbar" und „vertrauenswürdig".

---

## Was in ein Spec muss

- Das Sprachprofil als **validiertes Schema**. Eine Sprache ohne
  Zähleinheit-Angabe darf nicht ladbar sein — sonst rechnet das Levelmodell
  stillschweigend falsch, und zwar genau in den Sprachen, wo es am wenigsten
  auffällt.
- Die Qualitätsstufe als abgeleiteter Wert aus dem, was im Profil vorhanden ist —
  nicht als handgesetztes Feld. Ein Feld, das jemand auf „A" stellt, ist keine
  Qualitätsaussage.
- Wie der Fertigkeitsstatus auf Stufe C gesetzt wird — das ist derselbe
  Mechanismus wie in [14](14-barrierefreiheit.md), aus einem anderen Grund
  ausgelöst.
