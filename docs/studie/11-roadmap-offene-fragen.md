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

F17–F22, **F110** (Fertigkeitsstatus) und **F102** (konfigurierbares
Fertigkeitsprofil). Ab hier ist sie *anders* als alles andere. Das ist der Punkt,
an dem sich zeigt, ob die Kernidee trägt: sagt die berechnete Zahl etwas, das der
Nutzer als zutreffend erlebt?

F110 und F102 müssen **hier** kommen und nicht später: ein Levelmodell, das eine
abgewählte oder ungemessene Fertigkeit mitrechnet, liefert für manche Nutzer
dauerhaft falsche Zahlen ([14](14-barrierefreiheit.md)), und nachträglich zu
ändern heißt, allen Nutzern die Historie zu verbiegen.

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

### Querschnitt · gilt ab der ersten Zeile Code

Vier V1-Punkte gehören keiner Stufe, weil sie **jede** betreffen. Sie werden
sonst zuverlässig vergessen, weil sie nie „dran" sind:

| # | Was | Warum nicht später |
| --- | --- | --- |
| **F107** | Jedes fertigkeitsgebundene Spec benennt seinen Alternativweg | Eine Prozessregel. Ab dem ersten Spec kostenlos, danach eine Aufgabenmodell-Änderung mit Nutzerdaten daran ([14](14-barrierefreiheit.md)) |
| **F103** | Karten mündlich oder per Auswahl beantwortbar, gleichwertig gezählt | Steckt im Aufgabenmodell aus Stufe 0/1. Nachträglich heißt: Historie neu bewerten |
| **F83** | Datenexport, vollständig | [`../CONSTITUTION.md`](../CONSTITUTION.md) §2. Ein Export, der erst nach einem Jahr Daten gebaut wird, ist ein Migrationsprojekt |
| **F85** | Meldeweg für falsche Inhalte | Ab dem ersten generierten Satz. Ohne ihn gibt es keine Rückmeldung darüber, wie gut die Generierung eigentlich ist ([10](10-antipatterns.md), A5) |

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

**Stand 2026-08-08: die vier blockierenden Fragen sind beantwortet.** Stufe 0 ist
damit freigegeben. Offen bleiben 5–10 und 12–14; keine davon blockiert die
Stufen 0 bis 2.

### ✔ 1 · Für wen ist das? — **beantwortet 2026-08-08**

**Erst ein Werkzeug für den Autor, später offen.** Also: bauen wie ein Werkzeug
(kein Konto nötig, Daten lokal, generierte Inhalte ungeprüft nutzbar), aber
Datenmodell und Datenschutz so, dass ein Produkt daraus werden kann.

Was das jetzt schon erzwingt, weil es nachträglich teuer ist:

- **Datenmodell mehrsprachig und nutzergebunden** von Anfang an ([ADR-0004](../adr/0004-word-task-data-model.md)).
- **Datenexport vollständig** (F83) — bei einem Werkzeug für einen Menschen ist
  das ohnehin die wichtigste Funktion.
- **Meldeweg** (F85) existiert, auch wenn er zunächst nur in eine Datei schreibt.
  Ohne ihn gibt es keine Aussage darüber, wie gut die Generierung ist.

Was das **erlaubt** zu verschieben: Redaktion der Startdecks, Muttersprachler-Stichproben,
Konto und Mehrbenutzerbetrieb, Kostenoptimierung beim LLM.

### ✔ 2 · Welche Sprache zuerst? — **beantwortet 2026-08-08**

**Deutsch → Spanisch *und* Deutsch → Italienisch.** Zwei Paare, nicht eines.

Ich hatte eines empfohlen. Zwei sind trotzdem die bessere Wahl, und zwar aus
einem Grund, der erst beim Durchdenken auffällt: **die beiden Sprachen sind
morphologisch fast baugleich.** Romanische Verbmorphologie, gleiche Wortarten,
gleiche Flexionslogik — der Lemmatisierer wird zu ~80 % geteilt, und was nicht
geteilt wird, sind Tabellen, kein Code. Der Zusatzaufwand liegt bei den
**Inhalten**, nicht bei der Architektur.

Und es kippt eine Reihenfolge, was gut ist: **UC-025 (zwei Sprachen ohne
Interferenz) rutscht von Stufe 6 auf Stufe 0.** Das Datenmodell ist damit von
der ersten Zeile an mehrsprachig, statt es später nachzurüsten — genau die Art
Nachrüstung, die allen Nutzern die Historie verbiegt.

Der reale Preis, ehrlich benannt:

- **Zwei Kalibrierungen**, nicht eine. Die Wortschatzanker aus
  [03](03-level-modell.md) sind **[C]** und müssen pro Sprache justiert werden.
- **Zwei Inhaltsbestände** — Texte, Audio, Sprecherpools. Das ist die eigentliche
  Verdopplung.
- **Verwechslungen zwischen ES und IT** sind ab Tag eins ein echtes Problem, weil
  sich beide Sprachen ähnlich genug sind. Das wird zu einer diagnostizierbaren
  Fehlerart mit Minimalpaar-Reparatur (UC-013, UC-025) — Mehrarbeit, aber es ist
  auch ein Alleinstellungsmerkmal, das kein Mitbewerber hat.

### ✔ 3 · Web oder native App? — **beantwortet 2026-08-08: Web zuerst**

Weg (a): Web/PWA für die Stufen 1–3, native Hülle erst vor Stufe 4 entscheiden.
Die Begründung unten bleibt als Kontext stehen — besonders der Satz, dass die
Entscheidung bei Stufe 4 nochmal auf den Tisch kommt und **nicht** stillschweigend
zu „Web für alles" wird.

Grundriss ist Next.js, also Web/PWA. Für Karten, Lesen und Level reicht das
vollständig. Für Stufe 4 wird es eng: Hintergrundaudio, Sperrbildschirm-Tasten,
zuverlässige Spracherkennung und Offline-Audio sind im Web — besonders auf iOS —
entweder schwierig oder unmöglich.

Drei gangbare Wege: (a) Web zuerst, native Hülle später; (b) Web für alles außer
Hören, Hören nativ; (c) von Anfang an nativ, dann ist Grundriss die falsche
Basis. **Empfehlung: (a)** — die Stufen 1–3 haben keinen nativen Bedarf, und bis
Stufe 4 ist genug gelernt, um die Entscheidung besser zu treffen.

### ✔ 4 · Ein Wort = eine Karte oder eine Karte pro Aufgabe? — **entschieden 2026-08-08**

**Wort → mehrere Aufgaben, jede mit eigenem FSRS-Zustand.** Ausgeführt und
begründet in [ADR-0004](../adr/0004-word-task-data-model.md), inklusive der drei
verworfenen Alternativen und der Kosten.

Zwei Dinge, die daraus folgen und hier stehen müssen, weil sie Stufe 1 betreffen:

- **Die Wortschatzschätzung zählt Wörter, die Sitzung zählt Aufgaben.** Ein
  Lernender mit 500 Wörtern hat ~2.000 Aufgaben. Diese Zahl wird nie angezeigt —
  die Sitzung mit fester Länge (F04) ist damit keine Annehmlichkeit, sondern
  eine Anforderung des Datenmodells.
- **⚠ SPEC GAP:** Der Mindestabstand zwischen zwei Aufgaben desselben Wortes ist
  unentschieden. Vier Aufgaben eines Wortes driften sonst zusammen und klumpen.
  Gehört ins Scheduler-Spec, siehe
  [`../specs/service/scheduler.md`](../specs/service/scheduler.md).

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

### ✔ 11 · Darf eine Methode ganz verschwinden? — **beantwortet 2026-08-08**

**Ja, ausblenden ist erlaubt.** Entscheidung des Nutzers dieser Studie.

Ausgearbeitet in [12](12-methodenkarten.md), Abschnitt „Ausblenden": nur über
die Einstellungen erreichbar (nicht aus dem Sitzungsverlauf heraus), mit einem
einmaligen Hinweis aus den eigenen Daten, dauerhaft sichtbar als ausgeblendet,
jederzeit rückholbar — und **die Konsequenz für das Levelmodell wird gezogen**:
wer alle Methoden einer Fertigkeit ausblendet, bekommt dort „nicht gemessen",
keine niedrige Zahl.

A15 in [10](10-antipatterns.md) bleibt gültig und ist abgegrenzt: es verbietet
dem **Algorithmus** das Aussortieren, nicht dem Menschen.

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
