# 22 · Gestaltung: was die Oberfläche verspricht

Noch keine Farbentscheidung — die kommt später und gehört dir
([`../AGENTS.md`](../../AGENTS.md), Grenze 6). Was hier steht, sind die
**Randbedingungen**, damit die spätere Sitzung nicht bei null anfängt, und ein
Argument, das die Wahl enger macht, als sie zuerst aussieht.

---

## Die Oberfläche gibt ein Versprechen ab, bevor jemand liest

Bevor ein Wort gelesen wird, hat die Gestaltung schon gesagt, was für ein Ding
das ist. Kräftige Farben, runde Formen, springende Figuren sagen: *das hier ist
ein Spiel, es wird leicht, du wirst belohnt.*

Und dann liefert dieses Produkt: ein Diktat. Eine Karte, die du zum vierten Mal
falsch hast. Ein Levelwert, der gesunken ist. Eine Methodenkarte mit dem
Pflichtabschnitt „was das nicht leistet".

> **Das ist der eigentliche Punkt: Wenn die Gestaltung ein Spiel verspricht und
> das Produkt Arbeit liefert, wirkt jede ehrliche Anzeige wie ein Wortbruch.**

Duolingos Optik ist nicht zufällig so — sie ist die exakt richtige Verpackung
für ein Produkt, das an Rückkehr gemessen wird ([01](01-duolingo.md), D1). Sie
zu übernehmen und die Mechanik wegzulassen, wäre die schlechteste Kombination:
das Aussehen erzeugt die Erwartung, die die Mechanik dann enttäuscht.

Die Umkehrung ist aber genauso falsch. Nüchtern, grau und akademisch erzeugt die
App, die didaktisch recht hat und die niemand öffnet — ein Ausgang, den
[08](08-motivation.md) ausdrücklich als reales Risiko benennt.

---

## Wonach also gestalten?

**[D]** Die Zielempfindung ist nicht *Spiel* und nicht *Lehrbuch*, sondern:

> **Ein gut gemachtes Werkzeug, das dich ernst nimmt.**

Etwas, das ruhig aussieht, Text gut behandelt und dann an genau einer Stelle
kräftig wird. Deine Beobachtung mit der dynamischen Serif geht in dieselbe
Richtung, und sie passt aus einem inhaltlichen Grund: **dieses Produkt ist
textlastig.** Herleitungen, Infoseiten, Erklärungen am Fehlerpunkt, die
Ursachenzeile unter dem Diagramm, der Wochenrückblick in Sätzen. Eine
Oberfläche, die Text schlecht behandelt, macht die Hälfte der Studie
unbenutzbar.

Vier Randbedingungen, die aus den vorherigen Kapiteln folgen und keine
Geschmacksfragen sind:

### G1 · Farbe trägt Bedeutung, nicht Dekoration

Wenn alles bunt ist, kann Farbe nichts mehr sagen. Diese App muss farblich
unterscheiden können: sicher / wackelig / neu, gemessen / unsicher / nicht
gemessen, im Abdeckungsband / darüber / darunter. Das sind viele Bedeutungen —
und sie brauchen eine ruhige Umgebung, um lesbar zu sein.

**Vorschlag [D]:** warme, gedämpfte Grundfläche, **eine** kräftige Akzentfarbe,
sparsam eingesetzt, plus die semantischen Paare aus
[`../DESIGN-SYSTEM.md`](../DESIGN-SYSTEM.md). Kräftig darf sein — aber an
wenigen Stellen, und dort dann richtig.

### G2 · Nie Farbe allein

Aus [14](14-barrierefreiheit.md) und
[`../CONSTITUTION.md`](../CONSTITUTION.md) §3: Jede Bedeutung, die farblich
gezeigt wird, hat zusätzlich Form, Position oder Text. Der Wortschatz-Atlas und
die Verlaufskurven sind der harte Fall — sie brauchen ohnehin eine textliche
Entsprechung (F106).

### G3 · Die Hauptanzeige gehört dem, was zu optimieren nützt

[10](10-antipatterns.md), A1 ist eine Gestaltungsregel, bevor es eine
Produktregel ist. Was groß und oben steht, wird optimiert. Also steht dort das
Levelprofil und die Karte ([19](19-meilensteine-und-karte.md)) — nicht eine
Serie, nicht eine Aktivitätszahl.

### G4 · Kein Feiern von Fehlerfreiheit, kein Bestrafen von Fehlern

Ein Fehler ist der Lernvorgang ([02](02-evidenz.md), E1). Die Gestaltung darf
ihn nicht wie ein Unglück aussehen lassen — kein Rot mit Ausrufezeichen, kein
Zusammenzucken. Umgekehrt auch keine Konfetti-Momente für eine fehlerfreie
Sitzung: das trainiert Vermeidung.

---

## Was später zu entscheiden ist

Wenn die Farbkonzepte drankommen, sind das die offenen Punkte — bewusst als
Fragen, nicht als Vorwegnahme:

1. **Wie kräftig?** Duolingo-bunt, gedämpft-warm, oder fast monochrom mit einem
   starken Akzent. Meine Neigung ist Nummer drei, aus G1 — aber das ist
   Geschmack plus ein Argument, keine Ableitung.
2. **Serif wofür?** Nur Überschriften und Lerntext, oder durchgehend. Bei
   Zielsprachentext ist Lesbarkeit über Ästhetik zu stellen, und bei
   nicht-lateinischen Schriften ist die Wahl ohnehin eine andere
   ([18](18-sprachen-baukasten.md), U2).
3. **Wie sieht ein gesunkenes Level aus?** Der Testfall für die ganze Haltung.
   Es muss sichtbar sein, ohne wie eine Strafe zu wirken
   ([03](03-level-modell.md), Ehrlichkeitsregel 1).
4. **Wie sieht „nicht gemessen" aus?** Nicht wie eine Lücke, nicht wie ein
   Fehler — wie eine sachliche Angabe.

Punkte 3 und 4 sind die eigentlichen Prüfsteine. Eine Palette, die fröhliche
Zustände gut aussehen lässt, ist leicht. Eine, die auch die ehrlichen Zustände
würdig darstellt, ist die Aufgabe.

---

## Was jetzt schon feststeht

Aus [`../AGENTS.md`](../../AGENTS.md) und den Gates, unabhängig von jeder Palette:

- Alle Werte als Token in `app/globals.css`, keine rohen Farben in Komponenten.
- WCAG AA in **beiden** Themes, geprüft von `npm run check:contrast` — die
  Palette wird also gegen den Gate entworfen, nicht danach repariert.
- Jedes interaktive Element mit allen fünf Zuständen.
- Kein Bildschirm, der ohne Farbe unbrauchbar wird.
