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

## Die fünf Kernthesen

Alles Weitere hängt an diesen fünf Sätzen. Wer nur fünf Minuten hat, liest nur
diese Tabelle.

| # | These | Folgt daraus |
| --- | --- | --- |
| **1** | Duolingos Problem ist nicht die Gamification, sondern **wofür** sie optimiert: tägliche Rückkehr statt Sprachkompetenz. | Fortschritt wird an gemessener Kompetenz angezeigt, nicht an Aktivität. → [08](08-motivation.md) |
| **2** | Wiederholung ist gelöst — aber nur, wenn der Lernende dem Zeitplan **vertraut**. Vertrauen entsteht durch Sichtbarkeit, nicht durch Genauigkeit. | Der Scheduler ist eine sichtbare Oberfläche, keine Blackbox. → [04](04-karteikarten-srs.md) |
| **3** | Karteikarten bauen **Wissen über** Wörter. Flüssigkeit entsteht nur aus Volumen an verständlichem Input. Beides ist nötig, keins ersetzt das andere. | Zwei gleichrangige Säulen: SRS **und** Lesen/Hören. → [05](05-input-lesen-hoeren.md) |
| **4** | „Level A2" ist keine Zahl, sondern ein Bündel aus vier Fertigkeiten mit sehr unterschiedlichem Stand. Ein einziger Fortschrittsbalken lügt. | Level-Modell mit Sublevels **pro Fertigkeit**, plus ein ehrliches Gesamtlevel. → [03](03-level-modell.md) |
| **5** | Die wirksamsten Übungen sind unbequem und teilweise nicht am Handy: Diktat, Handschrift, freies Produzieren. | Die App plant auch Offline-Übungen und nimmt deren Ergebnis wieder auf. → [07](07-offline-papier.md) |

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
| [Quellen](quellen.md) | Literatur, mit ehrlicher Kennzeichnung was nachgeprüft wurde |

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
