# 04 · Karteikarten mit sichtbarem Gedächtnismodell

Klassische Karteikarten, aber der Zeitplan ist keine Blackbox. Deine Formulierung
war: *„wo auch angezeigt werden kann, was genau passiert und wann welche Karten
drankommen werden."* Das ist der zweite große Unterschied zu allem, was es gibt —
Anki kann es prinzipiell, zeigt es aber nur Eingeweihten; Duolingo zeigt es
niemandem.

---

## Der Algorithmus: FSRS, nicht SM-2 **[A]**

| | SM-2 (Anki-Klassiker, 1987) | FSRS (Free Spaced Repetition Scheduler) |
| --- | --- | --- |
| Gedächtnismodell | ein Wert pro Karte („ease factor", Start 2,5) | drei Größen: **Stabilität**, **Schwierigkeit**, **Abrufwahrscheinlichkeit** |
| Anpassung | feste Regeln für alle | 17 trainierbare Parameter, optimiert auf die *eigene* Wiederholungshistorie |
| Zielgröße | Intervall | gewünschte Behaltenswahrscheinlichkeit (z. B. 90 %) |

Belege: die Ausgangsarbeit (Ye, KDD 2022) berichtet rund 12,6 % Verbesserung
gegenüber bestehenden Verfahren; Benchmarks über Millionen Wiederholungen zeigen
FSRS auch **ohne** persönliche Optimierung genauer als SM-2 für praktisch alle
getesteten Nutzer. Praktischer Effekt: etwa **20–30 % weniger Wiederholungen bei
gleichem Behalten**. Seit Anki 23.10 nativ enthalten.

Drei Gründe, warum das für uns mehr als eine Prozentzahl ist:

1. **Es ist erklärbar.** „Abrufwahrscheinlichkeit heute: 91 %" ist ein Satz, den
   ein Mensch versteht. „Ease Factor 2,35" ist keiner. Der Algorithmus, der
   besser rechnet, ist zufällig auch der, der sich besser anzeigen lässt — das
   ist der eigentliche Grund für die Wahl.
2. **Es hat einen Regler mit Bedeutung.** Die Zielretention (z. B. 85 % statt
   90 %) ist eine echte Nutzerentscheidung zwischen Aufwand und Sicherheit, und
   ihre Konsequenz ist vorhersagbar und anzeigbar.
3. **Es liefert die Levelmessung mit.** Stabilität pro Karte ist genau die
   Größe, aus der [03](03-level-modell.md) den Unterschied zwischen „gesehen"
   und „gekonnt" berechnet.

**Offene Frage:** eigene Implementierung oder eine der offenen FSRS-Bibliotheken
einbinden. Siehe [11](11-roadmap-offene-fragen.md), Frage 4.

---

## Die gläserne Planung

Vier Ansichten. Zusammen sind sie das Alleinstellungsmerkmal.

### G1 · Diese Karte — „warum jetzt?"

Auf jeder Karte abrufbar, ohne die Sitzung zu verlassen:

```
  casa · das Haus
  ─────────────────────────────────────────────
  Zuletzt:        vor 12 Tagen  ✓ richtig, 1,4 s
  Stabilität:     23 Tage         ▁▂▃▅▆  (wächst)
  Heute abrufbar: 89 %          ← deshalb kommt sie jetzt
  Bei „gewusst":  in 34 Tagen wieder
  Bei „schwer":   in 9 Tagen wieder
  Gesehen:        7× · davon 1 Fehler (vor 3 Monaten)
```

Die zwei Zeilen „bei gewusst / bei schwer" sind das Wichtigste: sie machen die
Selbsteinschätzung zu einer **Entscheidung mit sichtbarer Konsequenz** statt zu
einem Ratespiel. Nutzer klicken sonst systematisch falsch, weil sie nicht
wissen, was ihre Antwort bewirkt.

### G2 · Die nächsten Tage — der Wiederholungshorizont

Ein Balkendiagramm der fälligen Karten für die kommenden 30 Tage, plus eine
Zeile Klartext:

> Nächste Woche werden es weniger (Ø 34/Tag statt 51). Der Berg am 14. kommt von
> den 60 Karten, die du am 2. neu angelegt hast.

Die **Ursachenzeile** ist der Punkt. Ein Diagramm allein erzeugt Angst; ein
Diagramm mit Erklärung erzeugt Verständnis für den Zusammenhang zwischen
„heute viele neue Karten" und „in zwei Wochen viel Arbeit". Das ist die
Lektion, die Anki-Nutzer typischerweise erst nach dem ersten Zusammenbruch
lernen.

### G3 · Der Wortschatz-Atlas

Alle Karten, angeordnet nach **Frequenzrang** (x) und **Stabilität** (y). Ein
Blick zeigt:

- die zusammenhängende beherrschte Zone am linken Rand,
- die Löcher darin — häufige Wörter, die man noch nicht sicher kann; das sind
  die lohnendsten Karten überhaupt,
- den Rand, an dem man gerade arbeitet.

Direkter Anschluss an [03](03-level-modell.md): dieses Bild *ist* die
Wortschatzschätzung, nur sichtbar gemacht.

### G4 · Der Rückblick — „was ist eigentlich passiert?"

Wöchentlich, informational formuliert: was neu dazukam, was von „instabil" nach
„stabil" gewandert ist, welche Karten dich wiederholt scheitern lassen
(„Leeches"), und wie sich daraus das Level bewegt hat.

---

## Kartentypen

Aus [02](02-evidenz.md), E3 folgt: es gibt nicht *die* Karte für ein Wort,
sondern mehrere Aufgaben mit getrennten Zeitplänen.

| Typ | Aufgabe | Trainiert | Wann eingeführt |
| --- | --- | --- | --- |
| **Erkennung** | L2 → 4 Optionen | Ersteinprägung | nur die ersten 1–2 Male |
| **Bedeutungsabruf** | *casa* → ? | Lesen, Hören | ab Wiederholung 2 |
| **Formabruf** | „das Haus" → ? | Sprechen, Schreiben | wenn Bedeutungsabruf stabil |
| **Hörabruf** | Audio → ? | Hören; deckt Wörter auf, die nur *gelesen* bekannt sind | ab A1, für jedes Wort |
| **Lückensatz** | „Vivo en una ___ grande." | Form im Kontext, Kollokation | ab A2 |
| **Produktionssatz** | Satz mit Zielwort selbst bilden | freie Produktion | ab B1, seltener |
| **Minimalpaar** | *ser* / *estar* unterscheiden | die typische Fehlerklasse ([02](02-evidenz.md), E6) | wenn Verwechslung erkannt |

Wichtig: **Hörabruf für jedes Wort, von Anfang an.** Der häufigste stille Defekt
von Vokabelapps ist ein Wortschatz, der nur schriftlich existiert. Wer *ciudad*
liest und versteht, aber im Gespräch nicht erkennt, hat die Karte umsonst
gelernt. Das ist auch eine Levelaussage: solche Wörter zählen bei „Lesen", nicht
bei „Hören".

### Wo Karten herkommen

Selbst anlegen ist die Hürde, an der Karteikarten-Apps scheitern. Deshalb, in
dieser Reihenfolge:

1. **Mitgeliefert**, frequenzsortiert pro Sprache und Level — man kann am ersten
   Tag ohne jede Entscheidung anfangen ([01](01-duolingo.md), S3).
2. **Aus Fehlern erzeugt.** Jedes falsch verstandene Wort im Hörbuch, jedes
   Diktatwort, jede Korrektur aus dem Gespräch wird angeboten. Das ist die beste
   Quelle, weil sie belegt relevant ist.
3. **Beim Lesen angetippt** ([05](05-input-lesen-hoeren.md)) — ein Tipp, eine
   Karte, mit dem Satz als Kontext.
4. **Selbst geschrieben**, mit Vorschlägen und Warnung bei bekannten Fallen
   (zwei Sprachen auf einer Karte, Karte mit fünf Bedeutungen).

---

## Die drei Fallen, die Karteikarten-Apps töten

### Die Rückstandsfalle

Zwei Wochen Pause → 900 fällige Karten → App löschen. Das ist der häufigste
Ausstiegsgrund bei Anki, und er ist ein reines Anzeigeproblem.

**Lösung [D]:** Es gibt **keinen Rückstandszähler**. Eine Sitzung hat eine feste,
vom Nutzer gewählte Länge (z. B. 15 Minuten oder 40 Karten). Was hineinpasst,
wird nach Dringlichkeit priorisiert — am stärksten überfällig und am häufigsten
zuerst. Der Rest wird stillschweigend umverteilt. Statt „871 überfällig" steht
dort:

> Du warst zwei Wochen weg. Die wichtigsten 40 kommen zuerst, den Rest ziehe ich
> über die nächsten 10 Tage nach.

Die Karten sind nicht verschwunden — G2 zeigt sie weiter. Aber die Zahl, die
Scham erzeugt, ist keine Hauptanzeige.

### Die Leech-Falle

Ein paar Karten scheitern immer wieder und fressen unverhältnismäßig viel Zeit.
Fast immer ist die **Karte** schlecht, nicht der Kopf: zu viele Bedeutungen,
kein Kontext, Verwechslung mit einem Nachbarwort.

**Lösung:** Nach n Fehlern wird die Karte automatisch stillgelegt und zur
Reparatur vorgeschlagen — mit einer Diagnose („du verwechselst sie mit *X*" →
Minimalpaar-Karte) statt mit mehr Wiederholungen.

### Die Einbahnstraßen-Falle

Karten werden gelernt und nie verwendet. Wortschatz ohne Begegnung im Kontext
bleibt Prüfungswissen.

**Lösung:** Der Input-Teil ([05](05-input-lesen-hoeren.md)) wählt Texte
bevorzugt so aus, dass sie **kürzlich gelernte Karten enthalten**. Die Karte
wird nicht nur wiederholt, sie wird *getroffen* — und das ist der Moment, in dem
Vokabeln aufhören, Vokabeln zu sein.

---

## Was in ein Spec muss

- Ein Zustandsdiagramm der Karte (neu → lernend → jung → reif → stillgelegt →
  archiviert) mit **terminalen Zuständen** — siehe [`../STATE.md`](../STATE.md).
- Die Priorisierungsregel für den Sitzungszuschnitt (die Rückstandsfalle ist ein
  Sensitive-Change: sie entscheidet, was ein Nutzer *nicht* zu sehen bekommt).
- Wie Karten für dasselbe Wort in verschiedenen Richtungen zusammenhängen — eine
  Wortkarte mit mehreren Aufgaben, oder mehrere unabhängige Karten? Das ist die
  teuerste Datenmodell-Entscheidung im ganzen Projekt.
  Siehe [11](11-roadmap-offene-fragen.md), Frage 4.
