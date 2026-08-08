# 06 · Produktion: Sprechen und Schreiben

Die Fertigkeiten, wegen derer die meisten Menschen eine Sprache lernen, und die
in Apps am schlechtsten bedient sind. Duolingo lässt vorgegebene Sätze
nachsprechen; das ist Aussprachetraining, keine Produktion
([01](01-duolingo.md), D4).

---

## Warum Produktion mehr ist als Input plus Zeit **[B]**

Input allein erzeugt Verstehen, nicht Sprechen. Die dahinterliegende Erklärung
(Swains Output-Hypothese, gestützt von der Noticing-Forschung): Erst wenn man
etwas *sagen* muss, merkt man, was man nicht sagen kann. Diese Lücke ist der
Auslöser dafür, im nächsten Input genau darauf zu achten.

Praktisch heißt das: der Wert einer Produktionsübung liegt nicht in der
produzierten Äußerung, sondern **im Scheitern und in der darauf folgenden
Korrektur**. Eine Produktionsübung ohne Rückmeldung ist fast wertlos.

---

## Der Gesprächspartner

Ein LLM-basierter Gesprächspartner ist die realistischste Lösung. Die
Meta-Analyse (Lyu et al. 2025) findet einen mittleren Effekt (g ≈ 0,608) und
nennt als Wirkfaktoren: Redegelegenheit ohne soziale Angst, unbegrenzte Geduld,
sofortige Rückmeldung ([02](02-evidenz.md), E10).

Und sie nennt die Schwäche, die das Design bestimmt: **LLMs bevorzugen
Flüssigkeit vor Korrektheit.** Sie gehen über subtile Fehler hinweg, weil das
konversationell höflich ist — und verfestigen sie damit.

### Der Korrekturregler **[D]**

Kein versteckter Systemprompt, sondern eine sichtbare Einstellung mit drei
Stufen, jederzeit im Gespräch umschaltbar:

| Stufe | Verhalten |
| --- | --- |
| **Fließen lassen** | Keine Unterbrechung. Alle Fehler werden gesammelt und **nach** dem Gespräch gezeigt |
| **Sanft** | Korrektes Umformulieren im Antwortsatz (Recast), ohne den Fluss zu brechen |
| **Streng** | Sofortige Unterbrechung bei jedem Fehler in der aktuellen Zielstruktur |

Die Forschung zu Korrekturfeedback (Lyster & Ranta und Nachfolger) findet
**Prompts** — den Lernenden zur Selbstkorrektur auffordern — im Schnitt wirksamer
als reine Recasts, weil Recasts oft gar nicht als Korrektur bemerkt werden.
Deshalb: „Sanft" ist die Voreinstellung *mit* Markierung, nicht ohne.

### Die Nachbesprechung

Der wertvollste Teil, und der, den kein Konkurrenzprodukt gut macht:

```
  Gespräch beendet · 6 min · 41 Äußerungen

  Was gut lief
    · Du hast das Perfekt 8× richtig verwendet (letzte Woche: 3× von 9)

  Wiederkehrende Fehler
    · ser/estar — 4× verwechselt          → Minimalpaar-Karten angelegt
    · Adjektivendung nach femininem Nomen → 3× → Kurzerklärung ansehen

  Umschifft
    · Du hast 5× „gut" gesagt, wo etwas Genaueres gepasst hätte
      → 6 Alternativen als Karten?
```

Der Abschnitt **„Umschifft"** ist die interessanteste Idee dieses Kapitels:
fortgeschrittene Lernende werden flüssig, indem sie alles vermeiden, was sie
nicht können. Das ist unsichtbar für jede Fehlerzählung — die Fehlerquote fällt,
während der Wortschatz stagniert. Vermeidung zu erkennen und anzusprechen ist
etwas, das ein Sprachlehrer tut und eine App bisher nicht.

### Anleitung beim ersten Mal **[B]**

Lernende, die explizit lernen, *wie* man mit dem KI-Partner umgeht, profitieren
messbar mehr als solche, die es selbst herausfinden ([02](02-evidenz.md), E10).
Also: eine 60-Sekunden-Einführung („bitte um Korrektur", „sag ihm dein Level",
„lass dich unterbrechen"), einmalig, überspringbar.

---

## Aussprache: ehrlicher als die Konkurrenz

> **Nachtrag:** Der eigentliche Aussprachehebel steht in
> [13](13-aussprache-hoerwahrnehmung.md) und setzt an der **Wahrnehmung** an,
> nicht an der Produktion. Dieser Abschnitt beschreibt, was für die
> Produktionsseite übrig bleibt — bewusst wenig.

Loewen & Sato (2018) fanden Duolingos Spracherkennung ungenau genug, dass sie
Aussprachebildung eher behindert. Falsches Aussprachefeedback ist schlimmer als
keines: es bestätigt Fehler und beschädigt das Vertrauen in *alle* anderen
Rückmeldungen der App.

**Regeln [D]:**

1. **Kein binäres Urteil.** Statt ✓/✗ ein Konfidenzband: „gut verstanden" /
   „mit Mühe" / „nicht sicher erkannt".
2. **Schwellenehrlichkeit.** Bei niedriger Erkennungssicherheit sagt die App
   das, statt zu raten: „Das konnte ich nicht sicher beurteilen."
3. **Auf Laute zeigen, nicht auf Sätze.** Nützlich ist „dein *ü* klingt wie ein
   *u*" — für die paar Laute, die für dieses Sprachpaar bekannt schwierig sind.
   Ein Gesamtscore für einen Satz ist Zahlenkosmetik.
4. **Selbstvergleich statt Modellvergleich.** Eigene Aufnahme direkt neben der
   Muttersprachleraufnahme abspielbar. Das eigene Ohr ist ein besseres
   Messgerät als eine schlechte Bewertung — und es ist kostenlos.

---

## Schreiben

Untergenutzt, weil unspektakulär, aber es hat einen entscheidenden Vorteil: es
ist **asynchron** und lässt sich in Ruhe korrigieren. Wer sich nicht traut zu
sprechen, schreibt.

| Format | Was es trainiert | Aufwand |
| --- | --- | --- |
| **Satz mit Zielwort bilden** | Aktivierung frischer Karten | minimal — gehört in den SRS ([04](04-karteikarten-srs.md)) |
| **Bild beschreiben** | freie Produktion, offenes Vokabular | klein |
| **Tagebuch, 3 Sätze** | echte Mitteilungsabsicht — der stärkste Motivator überhaupt | klein |
| **Zusammenfassen, was man gelesen hat** | Verbindung Input → Output; sehr wirksam, sehr unbeliebt | klein |
| **Rückübersetzung** (L1-Text → L2, dann Vergleich mit dem Original) | Strukturunterschiede; **das beste Format zum Erkennen von Vermeidung** | mittel |

Rückübersetzung verdient Hervorhebung: der Vergleich mit einer Musterlösung
zeigt nicht nur Fehler, sondern **was man anders gesagt hätte** — die
Umschiffungen aus der Nachbesprechung, nur in schriftlicher und damit prüfbarer
Form.

### Korrekturdarstellung

Diff-Ansicht, nicht Fließtext-Kritik. Pro Änderung eine Kategorie
(Grammatik / Wortwahl / Idiomatik / Stil), weil nur kategorisierte Korrekturen
in [03](03-level-modell.md) einfließen können und nur sie sichtbar machen,
welche Fehlerart sich über Wochen zurückbildet.

**Stil zuletzt.** Ein A2-Lernender, der eine Stilkorrektur bekommt, hört auf zu
schreiben. Stilhinweise erst ab B1 und immer als „geht auch"-Zusatz, nie als
Fehler markiert.

---

## Was in ein Spec muss

- Der Zustand des Gesprächs (bereit / Nutzer spricht / verarbeitet / antwortet /
  unterbricht-zur-Korrektur) — [`../STATE.md`](../STATE.md).
- Die Fehlerkategorien als geschlossene Liste in
  [`../GLOSSARY.md`](../GLOSSARY.md). Frei erfundene Kategorien machen den
  Wochenvergleich in [03](03-level-modell.md) wertlos.
- **Sensitive:** Audioaufnahmen sind personenbezogene Daten. Wo werden sie
  verarbeitet, wie lange gespeichert, verlassen sie das Gerät?
  [`../CONSTITUTION.md`](../CONSTITUTION.md) §2 gilt, und die Antwort gehört ins
  Spec, bevor die erste Aufnahmetaste existiert.
