# 11 · Reihenfolge, Messung, offene Fragen

---

## Die Reihenfolge

Nicht nach Attraktivität sortiert, sondern nach Abhängigkeit. Jede Stufe ist für
sich benutzbar — sonst ist es keine Stufe, sondern eine Bauphase.

### Stufe 0 · Fundament (unsichtbar)

Frequenzlisten und Lemmatisierung pro Sprache (F81), Datenmodell für Karten und
Wiederholungshistorie. Ohne diese Grundlage funktionieren weder die
Wortschatzschätzung (F17) noch der Abdeckungsrechner (F29) — also weder das
Levelmodell noch die Inhaltsauswahl.

> **Falle:** Diese Stufe ist unattraktiv und wird deshalb regelmäßig übersprungen.
> Wer sie überspringt, baut das Levelmodell auf geratenen Zahlen und muss später
> alles neu kalibrieren — mit einem sichtbaren Sprung in den Verläufen aller
> Nutzer ([03](03-level-modell.md), Ehrlichkeitsregel 4).

### Stufe 1 · Karteikarten mit gläserner Planung

F01–F07, F12, F73, F74, F78. **Ab hier ist die App benutzbar** und schon jetzt
besser als jede bestehende Karteikarten-App — nicht weil sie mehr kann, sondern
weil sie zeigt, was sie tut.

### Stufe 2 · Levelmodell

F17–F22, **F102** (konfigurierbares Fertigkeitsprofil). Ab hier ist sie *anders*
als alles andere. Das ist der Punkt, an dem sich zeigt, ob die Kernidee trägt:
sagt die berechnete Zahl etwas, das der Nutzer als zutreffend erlebt?

F102 muss **hier** kommen und nicht später: ein Levelmodell, das eine
abgewählte Fertigkeit mitrechnet, liefert für manche Nutzer dauerhaft falsche
Zahlen ([14](14-barrierefreiheit.md)), und nachträglich zu ändern heißt, allen
Nutzern die Historie zu verbiegen.

### Stufe 3 · Lesen

F29–F36, F39. Die zweite Säule. Ab hier schließt sich der Kreis: Karten führen
zu Texten, Texte erzeugen Karten.

### Stufe 4 · Hören

F41–F46, **F97–F101**. Der aufwendigste Teil und der mit dem größten Unterschied.
Bewusst nach dem Lesen, weil er die Transkript- und Synchronisationsinfrastruktur
braucht und weil der Abdeckungsrechner aus Stufe 3 hier wiederverwendet wird.

**HVPT gehört hierher und sollte zuerst kommen**
([13](13-aussprache-hoerwahrnehmung.md)). Es ist der billigste Teil der Stufe —
kein LLM, keine Spracherkennung, keine Synchronisation — und der mit der besten
Evidenz. Es macht außerdem die restliche Stufe wirksamer: wer die Kontraste
nicht hört, holt aus Hörbüchern weniger heraus.

> **Risiko dieser Stufe** ([15](15-umfeld.md)): Hier treten wir gegen
> Spezialisten an (Pimsleur, Migaku, Language Reactor), die echte Inhalte haben.
> Frage 6 — woher kommen die Audioinhalte — gehört **vor** dem Bau beantwortet,
> nicht währenddessen.

### Stufe 4b · Methodenwahl

F87–F93, F96. Kommt erst hier, weil eine Methodenauswahl mindestens vier
Methoden zur Auswahl braucht — vorher ist das Menü eine Liste mit einem Eintrag.
Die Wirkungsschätzung (F94) und die Erkundung (F95) kommen später: sie brauchen
Monate an Daten, bevor sie etwas anderes als Rauschen liefern
([12](12-methodenkarten.md)).

Wichtig für die Reihenfolge: **die Grundfrequenzen (F92) müssen mit dem Menü
zusammen kommen, nicht danach.** Ein Auswahlsystem ohne Untergrenzen konvergiert
nach wenigen Wochen auf die angenehmsten Methoden, und die Nutzer haben sich bis
dahin daran gewöhnt.

### Stufe 5 · Produktion und Offline

F51–F53, F60, F64–F67, F72. Erst wenn Rezeption trägt — Produktionsübung ohne
Wortschatz ist Frustration.

### Stufe 6 · Verfeinerung

Alles mit Urteil **V2** und **später** aus [09](09-feature-katalog.md), sortiert
nach dem, was die Messung (unten) als Engpass ausweist.

---

## Wie wir wissen, ob die App wirkt

Die Lehre aus [01](01-duolingo.md), S5: Wirksamkeitsmessung ist möglich, wird
aber typischerweise so gebaut, dass sie schmeichelt. Vier Regeln dagegen, ab
Stufe 2 eingebaut, nicht nachträglich:

1. **Vortest.** Ausgangsniveau wird gemessen, nicht selbstberichtet.
2. **Abbrecher zählen mit.** Die Kennzahl lautet „Fortschritt pro *begonnenem*
   Nutzer", nicht „pro Nutzer, der durchgehalten hat".
3. **Produktive Fertigkeiten werden getestet**, nicht nur rezeptive — auch wenn
   das teurer ist. Sonst messen wir das Leichte und behaupten das Schwere.
4. **Zwei Kennzahlen nebeneinander, nie einzeln:** Rückkehrquote **und**
   gemessener Fortschritt. Genau ihr Verhältnis beantwortet die Frage aus
   [08](08-motivation.md) — ob eine App ohne Ligen und Herzen weniger genutzt
   wird, und ob das durch besseres Lernen aufgewogen wird.

---

## Offene Fragen

Diese Fragen sind nicht rhetorisch — sie ändern jeweils, was gebaut wird. Die
mit ⚠ markierten blockieren Stufe 0 oder 1.

### ⚠ 1 · Für wen ist das?

Ein Werkzeug für dich (und ein paar Leute), oder ein Produkt für Fremde? Das
ändert fast alles: Redaktionsaufwand für Startdecks, Datenschutzanforderungen
für Audioaufnahmen, laufende LLM-Kosten, ob generierte Inhalte geprüft werden
müssen (A5) — und ob überhaupt ein Konto nötig ist.

### ⚠ 2 · Welche Sprache zuerst, aus welcher Ausgangssprache?

Frequenzlisten, Lemmatisierung und Levelkalibrierung sind **pro Sprache**
verschieden. Morphologiearme Sprachen (Englisch) sind deutlich billiger als
morphologiereiche (Russisch, Finnisch, Türkisch). Für die erste Version braucht
es genau ein Paar.

### ⚠ 3 · Web oder native App?

Grundriss ist Next.js, also Web/PWA. Für Karten, Lesen und Level reicht das
vollständig. Für Stufe 4 wird es eng: Hintergrundaudio, Sperrbildschirm-Tasten,
zuverlässige Spracherkennung und Offline-Audio sind im Web — besonders auf iOS —
entweder schwierig oder unmöglich.

Drei gangbare Wege: (a) Web zuerst, native Hülle später; (b) Web für alles außer
Hören, Hören nativ; (c) von Anfang an nativ, dann ist Grundriss die falsche
Basis. **Empfehlung: (a)** — die Stufen 1–3 haben keinen nativen Bedarf, und bis
Stufe 4 ist genug gelernt, um die Entscheidung besser zu treffen.

### ⚠ 4 · Ein Wort = eine Karte oder eine Karte pro Aufgabe?

Die teuerste Datenmodellentscheidung im Projekt ([04](04-karteikarten-srs.md)).
Getrennte Zeitpläne pro Abfragerichtung sind lernpsychologisch richtig
([02](02-evidenz.md), E3), vervielfachen aber die Kartenzahl und damit die
gefühlte Last. **Empfehlung:** ein Wort-Objekt mit mehreren *Aufgaben*, jede mit
eigenem FSRS-Zustand, aber gemeinsamer Darstellung im Atlas und in der
Wortschatzzählung — sonst zählt eine Vokabel dreimal.

### 5 · Wo läuft das LLM, und was kostet es?

Textgenerierung (F39), Gesprächspartner (F51) und Korrektur (F53) sind laufende
Kosten pro Nutzer und Monat. Client- oder serverseitig? Was passiert offline?
Gibt es eine brauchbare Version ohne LLM? Antwort nötig vor Stufe 3, nicht
vorher.

### 6 · Woher kommen die Audioinhalte?

Text-to-Speech ist billig, verfügbar und für Diktate und Karten völlig
ausreichend. Für Hörbücher ab B1 ist echte Sprache mit natürlichem Tempo,
Dialekt und Zögern der eigentliche Lerngegenstand — und da beginnen Lizenzfragen
(F49).

### 7 · Wie viel Gamification willst du wirklich weglassen?

[10](10-antipatterns.md) streicht Ligen, Herzen und XP. Das ist die
konsequenteste Position, und sie ist ein Risiko
([08](08-motivation.md), Ehrlichkeitsvorbehalt). Bist du bereit, es zu tragen,
oder soll etwas davon als abschaltbare Option existieren?

### 8 · Was kommt in die Constitution?

Vorschlag, vier Sätze aus dieser Studie nach
[`../CONSTITUTION.md`](../CONSTITUTION.md) zu heben:

- Was angezeigt wird, wird optimiert — prominent steht nur, was zu optimieren
  dem Lernen nützt.
- Kein Fortschrittswert ohne einsehbare Herleitung.
- Das Level darf sinken.
- Kein generierter Zielsprachen-Inhalt ohne Prüfung und Meldeweg.

Diese Regeln haben nur Wirkung, wenn sie eine direkte Anweisung überstimmen
können — deshalb Constitution und nicht Studie.

### 9 · Studie auf Deutsch, Code und Specs auf Englisch — passt das?

So ist es jetzt gebaut ([README](README.md)). Die Studie wird gelesen und
diskutiert, der Code wird gelesen und ausgeführt. Alternative wäre alles auf
Deutsch, dann aber konsequent inklusive Bezeichnern.

### 10 · Wie streng soll der Grundriss-Prozess hier gelten?

Grundriss verlangt Spec vor Code für alles außer Trivialem. Für ein Projekt
dieser Größe halte ich das für richtig — aber es kostet spürbar Tempo in den
ersten Wochen. Voll anwenden, oder Stufe 0 und 1 als Prototyp ohne Specs bauen
und die Specs danach nachziehen? (Meine Empfehlung: voll anwenden. Genau die
Entscheidungen, die hier früh fallen — Datenmodell, Levelberechnung,
Kartenzustände — sind die, die man später nicht mehr ändern kann, ohne allen
Nutzern die Historie zu verbiegen.)

### 11 · Darf eine Methode ganz verschwinden?

[12](12-methodenkarten.md) sagt nein: jede Methode behält ihre Grundfrequenz,
egal wie oft sie abgelehnt wird. Das ist die konsequente Position und sie folgt
direkt aus E13 — aber sie heißt auch, dass ein Nutzer dauerhaft etwas angeboten
bekommt, das er ausdrücklich nicht will, und das kann als Missachtung seines
Feedbacks ankommen.

Die Alternative wäre eine Ausstiegsmöglichkeit mit Reibung: „dauerhaft
abschalten" versteckt in den Einstellungen, mit einem einmaligen Hinweis, was es
kostet. Autonomiestützender, und riskiert genau die Verarmung, die A15 verhindern
soll. **[D]** Ich neige zur Ausstiegsmöglichkeit — Punkt 4 der Überzeugungsfrage
(„nicht überreden") gilt auch hier —, aber das ist deine Entscheidung.

### 12 · Welche Methoden bekommen welche Grundfrequenz?

Die Tabelle in [12](12-methodenkarten.md) ist ein Vorschlag **[D]**, kein
Forschungsergebnis. Sie legt fest, was das System für unverzichtbar hält, und
sollte deshalb bewusst gesetzt und datiert werden — wie die Kalibrierung in
[03](03-level-modell.md).

### 13 · Echte Sprecher oder TTS für HVPT?

Variabilität zwischen Sprechern ist bei HVPT der **Wirkstoff**, nicht die
Verpackung ([13](13-aussprache-hoerwahrnehmung.md)). Mehrere hochwertige
TTS-Stimmen sind billig und wahrscheinlich brauchbar; sie sind aber tendenziell
zu sauber und untereinander zu ähnlich, und ob das die Wirkung trägt, ist
ungeprüft. Echte Sprecheraufnahmen sind der einzige nennenswerte Aufwand des
sonst günstigsten Features der Studie.

### 14 · Eine Woche LingQ und Migaku benutzen — wer macht das?

[15](15-umfeld.md) beruht auf Produktbeschreibungen, nicht auf eigener Nutzung.
Bevor eine Roadmap-Entscheidung auf K1 oder K3 aufbaut, sollte jemand die beiden
tatsächlich benutzt haben. Das ist kein Recherche-, sondern ein Zeitproblem, und
es ist billig im Vergleich zu dem, was es verhindert.

---

## Was als Nächstes passiert

Sobald Frage 1–4 beantwortet sind:

1. `UC-004` bis `UC-010` schärfen (liegen als Entwurf in
   [`../use-cases/`](../use-cases/)).
2. ADR für die Datenmodellentscheidung aus Frage 4 schreiben — das ist der
   Lehrbuchfall für [`../adr/`](../adr/): teuer zu ändern, muss später
   verteidigt werden.
3. Stufe 0 als erste Spec-getriebene Arbeit
   ([`../WORKFLOW.md`](../WORKFLOW.md), Stufe 2).
