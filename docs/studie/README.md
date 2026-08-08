# Studie: Sprachenlernen

Warum diese App gebaut wird, was die Forschung dazu sagt, und was daraus an
Funktionen folgt.

Diese Studie ist **kein Spec**. Sie ist die Begründungsschicht darunter: sie
sammelt Evidenz, wertet sie, und leitet daraus Produktentscheidungen ab. Ein
Spec sagt *was gebaut wird*; diese Studie sagt *warum genau das und nicht etwas
anderes*. Wenn ein Spec und diese Studie sich widersprechen, gewinnt das Spec —
aber dann gehört hier ein Absatz geändert, der sagt warum.

Sprache: Deutsch, weil sie gelesen und diskutiert wird, nicht ausgeführt.
Der Code und die Specs bleiben englisch (siehe [`../GLOSSARY.md`](../GLOSSARY.md)).

---

## Die acht Kernthesen

Alles Weitere hängt an diesen acht Sätzen. Wer nur fünf Minuten hat, liest nur
diese Tabelle.

| # | These | Folgt daraus |
| --- | --- | --- |
| **1** | Duolingos Problem ist nicht die Gamification, sondern **wofür** sie optimiert: tägliche Rückkehr statt Sprachkompetenz. | Fortschritt wird an gemessener Kompetenz angezeigt, nicht an Aktivität. → [08](08-motivation.md) |
| **2** | Wiederholung ist gelöst — aber nur, wenn der Lernende dem Zeitplan **vertraut**. Vertrauen entsteht durch Sichtbarkeit, nicht durch Genauigkeit. | Der Scheduler ist eine sichtbare Oberfläche, keine Blackbox. → [04](04-karteikarten-srs.md) |
| **3** | Karteikarten bauen **Wissen über** Wörter. Flüssigkeit entsteht nur aus Volumen an verständlichem Input. Beides ist nötig, keins ersetzt das andere. | Zwei gleichrangige Säulen: SRS **und** Lesen/Hören. → [05](05-input-lesen-hoeren.md) |
| **4** | „Level A2" ist keine Zahl, sondern ein Bündel aus vier Fertigkeiten mit sehr unterschiedlichem Stand. Ein einziger Fortschrittsbalken lügt. | Level-Modell mit Sublevels **pro Fertigkeit**, plus ein ehrliches Gesamtlevel. → [03](03-level-modell.md) |
| **5** | Die wirksamsten Übungen sind unbequem und teilweise nicht am Handy: Diktat, Handschrift, freies Produzieren. | Die App plant auch Offline-Übungen und nimmt deren Ergebnis wieder auf. → [07](07-offline-papier.md) |
| **6** | Was sich beim Üben gut anfühlt, wirkt oft am wenigsten — und umgekehrt. Lernende halten das Falsche für wirksam, auch nachdem sie den Gegenbeweis erlebt haben. | Vorliebe und gemessene Wirkung sind **zwei getrennte Konten**. Vorliebe steuert die Form, Wirkung steuert die Auswahl. → [12](12-methodenkarten.md) |
| **7** | Das Aussprachproblem beginnt im Ohr, nicht im Mund. Wahrnehmungstraining ist billig, sehr gut belegt — und strahlt auf die Produktion aus. | HVPT als eigene Methode, statt Aussprache automatisch zu benoten. → [13](13-aussprache-hoerwahrnehmung.md) |
| **8** | Lernende bekommen überall einen **Kompass** — Richtung, Fortschritt, „weiter so". Niemand gibt ihnen eine **Karte**: wo stehe ich, was ist von hier erreichbar, was hat der letzte Monat aufgeschlossen. | Die Karte ist eine Hauptoberfläche, und jede Anzeige benennt die nächste. → [19](19-meilensteine-und-karte.md) |

---

## Aufbau

| Kapitel | Beantwortet |
| --- | --- |
| [01 · Duolingo](01-duolingo.md) | Was funktioniert dort wirklich, was nicht, und warum — inklusive der Stärken, die wir übernehmen sollten |
| [02 · Evidenz](02-evidenz.md) | Was die Lernforschung belastbar sagt, sortiert nach Effektstärke und Sicherheit |
| [03 · Levelmodell](03-level-modell.md) | GER, Sublevels, wie man ein Level *misst* statt behauptet, und der „bin ich besser geworden?"-Vergleich |
| [04 · Karteikarten & SRS](04-karteikarten-srs.md) | FSRS statt SM-2, Kartentypen, und die gläserne Planung |
| [05 · Input: Lesen & Hören](05-input-lesen-hoeren.md) | Hörbücher, Sprachbefehle, Antippen-zum-Übersetzen, Kurztexte auf Level |
| [06 · Produktion](06-produktion.md) | Sprechen und Schreiben, LLM-Tutor, Aussprachefeedback und dessen Grenzen |
| [07 · Offline & Papier](07-offline-papier.md) | Diktat, Handschrift, Konjugations- und Steigerungsdrills |
| [08 · Motivation](08-motivation.md) | Gamification, die nicht gegen das Lernen arbeitet |
| [09 · Feature-Katalog](09-feature-katalog.md) | Alle Ideen, jede mit Evidenzgrad, Aufwand und Urteil |
| [10 · Anti-Patterns](10-antipatterns.md) | Was wir bewusst **nicht** bauen, und was das kostet |
| [11 · Roadmap & offene Fragen](11-roadmap-offene-fragen.md) | Reihenfolge, Schnitt der ersten Version, und was du entscheiden musst |
| [12 · Methodenkarten](12-methodenkarten.md) | Tägliche Methodenauswahl, Daumen hoch/runter, und warum der Daumen allein das System kaputtmacht |
| [13 · Aussprache & Hörwahrnehmung](13-aussprache-hoerwahrnehmung.md) | HVPT — die stärkste Einzelmethode der Studie, und die, die fast keine App umsetzt |
| [14 · Barrierefreiheit](14-barrierefreiheit.md) | Legasthenie, Hören, Sehen — und warum das hier ein Rechen- und kein Darstellungsproblem ist |
| [15 · Das Umfeld](15-umfeld.md) | Anki, LingQ, Migaku, Busuu & Co. — was schon existiert, und welche unserer Thesen das korrigiert |
| [16 · Weitere Befunde](16-weitere-befunde.md) | Lernstil-Mythos, Chunks, Schlaf, und das erwünschte vs. das gesollte Selbst |
| [17 · Eigene Inhalte](17-eigene-inhalte.md) | Podcasts, hochgeladene Texte, Vereinfachung — und wo ich zwei der Ideen anders bauen würde |
| [18 · Sprachen-Baukasten](18-sprachen-baukasten.md) | Jede Sprache lernbar: was Code ist, was Daten, und die ehrliche Qualitätsstufe |
| [19 · Meilensteine & Karte](19-meilensteine-und-karte.md) | Wortschatz in Blöcken, und die Oberfläche, die zeigt wie alles zusammenhängt |
| [Quellen](quellen.md) | Literatur, mit ehrlicher Kennzeichnung was nachgeprüft wurde |

Kapitel 12–19 sind nach der Roadmap entstanden und deshalb hinten angehängt.
Inhaltlich gehört 12 neben [08](08-motivation.md), 13 neben
[06](06-produktion.md), 17 neben [05](05-input-lesen-hoeren.md), 19 neben
[03](03-level-modell.md), und 14, 15, 18 vor die Roadmap.

Zwei Kapitel **korrigieren** frühere: [15](15-umfeld.md) entschärft zwei zu
starke Aussagen in [05](05-input-lesen-hoeren.md), und
[18](18-sprachen-baukasten.md) korrigiert meine eigene Behauptung aus Frage 2,
Sprachen seien pauschal teuer.

---

## Wie Evidenz hier bewertet wird

Nicht jede Aussage in der Lernforschung ist gleich belastbar. Damit „die
Forschung sagt" nicht zum Totschlagargument wird, trägt jede Empfehlung in
dieser Studie eine Marke:

| Marke | Bedeutet |
| --- | --- |
| **[A]** | Mehrfach repliziert, Meta-Analysen vorhanden, Effekt auch außerhalb des Labors gezeigt |
| **[B]** | Gut belegt, aber mit Einschränkungen — wenige Studien, kurze Zeiträume, oder Laborkontext |
| **[C]** | Plausibel und verbreitet, aber dünn belegt oder umstritten |
| **[D]** | Produktentscheidung. Keine Evidenz, sondern eine Meinung mit Begründung |

Eine **[D]**-Entscheidung ist nicht schlechter als eine **[A]** — sie ist nur
anders begründet, und sie darf ohne neue Studien geändert werden. Der Fehler
wäre, sie als **[A]** zu verkaufen.

Ein Warnsatz vorweg: ein großer Teil der App-Wirksamkeitsforschung — auch die zu
Duolingo — hat kurze Laufzeiten, keinen Vortest und misst rezeptive Fertigkeiten,
weil die billig zu messen sind. Das ist in [01](01-duolingo.md) und
[quellen.md](quellen.md) im Detail vermerkt und gilt für *alle* Zahlen in dieser
Studie, auch für die, die unsere Thesen stützen.
