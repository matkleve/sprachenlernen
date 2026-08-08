# 15 · Das Umfeld: was andere schon gelöst haben

Ein Ehrlichkeitskapitel. [01](01-duolingo.md) vergleicht mit Duolingo, weil das
der Maßstab für Reichweite ist — aber Duolingo ist nicht die Konkurrenz für das,
was hier gebaut werden soll. Die Konkurrenz ist eine Handvoll kleinerer
Werkzeuge, die Teile unserer Kernidee **bereits umgesetzt haben**.

Wer das nicht nachliest, hält seine Idee für neuer, als sie ist, und baut
Bekanntes teuer nach.

---

## Die Landschaft

| Werkzeug | Kernidee | Was es für uns bedeutet |
| --- | --- | --- |
| **Anki** | SM-2/FSRS, vollständig konfigurierbar, alles selbst bauen | Der Maßstab für Scheduling. Sein Scheitern ist die Einstiegshürde, nicht der Algorithmus ([01](01-duolingo.md), S3) |
| **LingQ** | Texte lesen, unbekannte Wörter markieren, **Zähler bekannter Wörter** als Fortschrittsmaß | **Die größte Überschneidung.** Die Idee „Wortschatzgröße als Fortschrittsanzeige" ist dort seit Jahren zentral |
| **Migaku** | Wörter aus Netflix/YouTube „minen", eigene Karten, integriertes SRS, Kennzeichnung bekannter/unbekannter Wörter | Setzt die Kopplung Input → Karten bereits um |
| **Language Reactor** | Doppelte Untertitel, Popup-Wörterbuch, Wortstatus im Video | Setzt „Antippen zum Übersetzen" im Video um |
| **Clozemaster** | Lückensätze aus Korpora, nach Frequenz sortiert, gamifiziert | Setzt frequenzsortierte Kontextübung um |
| **Glossika** | Massenhaftes Satz-Shadowing mit verteilter Wiederholung | Der Chunk-Ansatz aus [16](16-weitere-befunde.md), konsequent durchgezogen |
| **Pimsleur** | Rein auditiv, verteilte Abfrage, freihändig | Das bildschirmfreie Szenario aus [05](05-input-lesen-hoeren.md), seit Jahrzehnten |
| **Babbel / Busuu** | Kursbasiert, GER-ausgerichtet, mit Muttersprachler-Korrektur (Busuu) | Die „seriöse" Mitte. Siehe Wirksamkeit unten |
| **italki / Tandem** | Echte Menschen | Das, was keine App ersetzt — und das, was [07](07-offline-papier.md), Ü5 vorbereiten statt ersetzen will |

---

## Was das an unseren Thesen ändert

Drei Korrekturen, die in [09](09-feature-katalog.md) und
[11](11-roadmap-offene-fragen.md) eingepreist gehören:

### K1 · „Abdeckungsbasierte Textauswahl" ist nicht neu **[Korrektur]**

LingQ und Migaku arbeiten mit dem Bestand bekannter Wörter und färben Texte
danach ein. Unser Unterschied ist enger als in [05](05-input-lesen-hoeren.md)
behauptet — er liegt nicht im Prinzip, sondern in drei Details:

- eine **Abdeckungszahl vor dem Öffnen** als Auswahlkriterium, statt Einfärbung
  während des Lesens;
- die Rückkopplung, dass bevorzugt Texte mit **kürzlich gelernten Karten**
  gewählt werden;
- dass die Abdeckung in ein **Levelmodell** einfließt statt nur in eine Zählung.

Das ist immer noch ein Unterschied, aber es ist eine Verfeinerung, keine
Erfindung. Der Satz „das macht sonst niemand" gehört gestrichen.

### K2 · „Wortschatzgröße als Fortschritt" gibt es — die Ehrlichkeit darum nicht

LingQ zählt bekannte Wörter, und die Zahl ist bekanntermaßen großzügig: sie
zählt Wortformen, beruht auf Selbsteinstufung und kann nur steigen. Genau die
drei Punkte, gegen die [03](03-level-modell.md) seine Ehrlichkeitsregeln
formuliert (Stabilität statt Sichtung, Familien statt Formen, darf sinken).

**Das ist die eigentliche Positionierung:** nicht „wir zählen deinen Wortschatz",
sondern „wir zählen ihn so, dass die Zahl etwas bedeutet".

### K3 · Die Kombination ist der Unterschied, nicht die Einzelteile

Jedes Element dieser Studie existiert irgendwo. Was nirgends existiert:

```
   SRS  ──sichtbar──►  Levelmodell  ──wählt aus──►  Input  ──erzeugt──►  SRS
                            ▲                                    │
                            └──────────── misst ─────────────────┘
```

Anki hat Scheduling ohne Inhalt. LingQ hat Inhalt ohne echtes Scheduling.
Migaku hat beides, aber keine Kompetenzmessung. Duolingo hat einen Pfad und
keine Messung. **Der geschlossene Kreis ist die These** — und Thesen dieser Art
scheitern selten am Konzept und meistens daran, dass jeder Ring einzeln
schlechter ist als das spezialisierte Werkzeug.

Das ist das reale Hauptrisiko dieses Projekts, und es steht bisher nirgends
sonst in der Studie.

---

## Was die Wirksamkeitsforschung über die Mitbewerber sagt **[C]**

Eine vergleichende Analyse (2023) hat die Wirksamkeitsstudien von Babbel, Busuu
und Duolingo nebeneinandergelegt:

| | Befund |
| --- | --- |
| **Busuu** | Vorne — umfassendste Ergebnisse für Lesen/Grammatik **und** mündliche Kompetenz, dank Studiendesign und kontrollierter Variablen |
| **Duolingo** | Höhere Werte bei rezeptiven Fertigkeiten, aber zweiter Platz wegen Studiendesign und fehlender Kontrolle von Lernzeit und Vorwissen |
| **Babbel** | Am schwächsten — die meisten Lernenden kamen trotz längerer Studiendauer nicht über Anfängerniveau hinaus |

Zwei Lehren, und die zweite ist die wichtigere:

1. Busuus Vorsprung hängt daran, dass **Produktion mit menschlicher Korrektur**
   Teil des Produkts ist. Das stützt [06](06-produktion.md) — und es ist der
   teuerste Teil, den ein LLM ersetzen soll, mit den bekannten Vorbehalten
   ([02](02-evidenz.md), E10).
2. Die Rangfolge sagt fast so viel über **Studienqualität** wie über Produkte.
   Der Vergleich ist nur so gut wie die schlechteste Studie darin, und alle drei
   sind Herstellerstudien. Behandle die Tabelle als Hinweis, nicht als Ergebnis
   ([02](02-evidenz.md), E12).

---

## Wo wir gegen die Spezialisten verlieren werden

Ehrlichkeitshalber, weil es die Roadmap beeinflusst:

| Gegen | Verlieren wir bei |
| --- | --- |
| **Anki** | Konfigurierbarkeit, Plugin-Ökosystem, Kartentyp-Freiheit. Bewusst — A11 |
| **Language Reactor / Migaku** | Echte Inhalte (Netflix, YouTube). Wir haben generiertes Material, sie haben das, was Leute wirklich sehen wollen |
| **Pimsleur** | Ausgereifter, professionell produzierter Audiokurs. Bei uns ist Stufe 4 das Schwierigste, bei denen ist es das Produkt |
| **italki** | Echte Menschen. Nicht aufholbar, und kein Ziel |

Die Konsequenz für [11](11-roadmap-offene-fragen.md): **Stufe 4 (Hören) ist der
Punkt, an dem wir gegen etablierte Spezialisten antreten**, während Stufe 1–2
(gläserner Scheduler, ehrliches Levelmodell) das Feld ist, in dem niemand
ernsthaft steht. Das ist ein zusätzliches Argument für die gewählte Reihenfolge —
und ein Argument dafür, bei Stufe 4 zuerst die Frage nach echten Inhalten (Frage
6) zu beantworten, bevor gebaut wird.

---

## Was fehlt

Diese Übersicht beruht auf Produktbeschreibungen und Vergleichsartikeln, nicht
auf eigener Nutzung. Vor einer Roadmap-Entscheidung, die auf K1 oder K3 aufbaut,
gehören LingQ und Migaku **eine Woche lang benutzt** — nicht gelesen. Eine
Feature-Liste sagt nichts darüber, wie sich ein geschlossener Kreis anfühlt,
wenn er halb geschlossen ist.
