# 05 · Input: Lesen und Hören

Die zweite Säule neben den Karteikarten. Karten bauen Wissen *über* Wörter;
Flüssigkeit entsteht nur aus Volumen. Beides ist nötig ([README](README.md),
These 3).

Deine Ideen aus der Anfrage — Hörbücher mit Sprachbefehlen, Kurztexte mit
Antippen-zum-Übersetzen, immer auf dem passenden Level — sind hier ausgearbeitet
und um das ergänzt, was die Forschung dazu sagt.

---

## Das Auswahlprinzip: 95–98 % bekannte Wörter

Kein Levellabel entscheidet, was jemand liest oder hört, sondern die
**berechnete lexikale Abdeckung für diesen konkreten Nutzer**
([02](02-evidenz.md), E4). Wir kennen seinen Kartenbestand, wir können jeden Text
tokenisieren — also können wir vorab sagen: *„von diesem Text kennst du 96,2 %
der Wörter; die 41 unbekannten sind diese hier."*

Das löst drei Probleme auf einmal:

- **Kein Levelraten.** Zwei B1-Texte können 90 % und 99 % Abdeckung haben.
- **Ehrliche Vorschau.** Jeder Text zeigt vor dem Öffnen seine Abdeckung.
- **Die Verbindung zurück zu den Karten.** Bei gleicher Abdeckung wird der Text
  bevorzugt, der die meisten **kürzlich gelernten** Karten enthält
  ([04](04-karteikarten-srs.md), Einbahnstraßen-Falle).

Anzeige, konkret:

```
  Der verschwundene Schlüssel        6 min · 98 % bekannt   ← angenehm
  Nachrichten: Wahlen in Chile       4 min · 91 % bekannt   ← anstrengend
  Ana kauft ein                      3 min · 100 % bekannt  ← Tempotraining
```

100 % ist ausdrücklich kein Fehler. Texte ohne unbekannte Wörter trainieren
**Geschwindigkeit und Automatisierung** — die Fertigkeit, die zwischen B1 und B2
den Unterschied macht und die von Vokabelapps völlig ignoriert wird.

---

## Lesen: Kurztexte mit Antippen

### Die Übersetzungsebene

Deine Idee („wenn man auf einen Satz drückt, zeigt es die Sprache an, die man
versteht") wird zu drei getrennten Ebenen, die einzeln zuschaltbar sind:

| Antippen von | Zeigt |
| --- | --- |
| **Wort** | Grundform, Bedeutung *in diesem Kontext*, Aussprache, Frequenzrang, „als Karte anlegen" |
| **Satz** | Übersetzung des ganzen Satzes |
| **Absatz** | Zusammenfassung — nicht Übersetzung, sondern „worum geht es hier" |

Die Ebene *Absatz* ist der interessante Fall: sie hilft, ohne die
Verstehensarbeit abzunehmen. Eine Wort-für-Wort-Übersetzung nimmt sie ab.

**Die Verzögerungsregel [D]:** Die Übersetzung erscheint erst nach einem kurzen
Moment oder einem zweiten Tippen. Ohne diese Bremse wird getippt, bevor der Kopf
überhaupt versucht hat zu verstehen — und dann ist die Übung wertlos
([02](02-evidenz.md), E1: ohne Abrufversuch kein Lerneffekt). Die Bremse muss
abschaltbar sein, aber sie muss standardmäßig da sein.

### Was in einem Text steckt

- **Vorentlastung**: die 5 wichtigsten unbekannten Wörter vorab, 20 Sekunden.
  Gut belegt, dass das Verstehen deutlich hebt, und kostet fast nichts.
- **Nach dem Lesen**: 2–3 Verständnisfragen (Abrufübung, E1), dann das Angebot,
  die angetippten Wörter als Karten zu übernehmen.
- **Lesezeit gemessen**: Wörter pro Minute ist eine Ebene-1-Messgröße für
  [03](03-level-modell.md) und die einzige, die Automatisierung sichtbar macht.

### Textquellen **[D]**

Am Anfang generiert (siehe [10](10-antipatterns.md), A5, zur Qualitätspflicht),
mittelfristig zusätzlich kuratierte Originaltexte für höhere Level. Für die
oberen Level ist generierter Text ohnehin die falsche Antwort — dort ist gerade
das Unregelmäßige, Idiomatische der Lerngegenstand.

---

## Hören: Hörbücher mit Sprachsteuerung

Das ist der ambitionierteste Teil und der mit dem größten Unterschied zu allem
Bestehenden.

### Der Grundmodus: Reading-while-listening

Audio plus synchronisiertes Transkript, mitlaufend hervorgehoben. Belegt
wirksam, weil das Audio den Text in bedeutungstragende Einheiten segmentiert —
genau das, was Anfängern fehlt („die reden so schnell") ([02](02-evidenz.md),
E11).

Drei Sichtbarkeitsstufen, jederzeit umschaltbar:

1. **Nur Audio** — die eigentliche Zielfertigkeit.
2. **+ Transkript in der Zielsprache** (*captions*) — verknüpft Klang und Schriftbild.
3. **+ Übersetzung** (*subtitles*) — stützt die Bedeutung.

Die Forschung ist uneins, welche Stufe wann überlegen ist. Deshalb: umschaltbar,
und die App **protokolliert**, welche Stufe genutzt wurde — auf Stufe 1
gehörtes Material zählt für „Hören" stärker als auf Stufe 3 gehörtes. Sonst
misst das Levelmodell Lesen und nennt es Hören.

### Sprachbefehle

Deine Kernidee: die Hände sind beim Hören frei, aber die Aufmerksamkeit ist beim
Text. Ein Sprachbefehl unterbricht den Fluss weniger als ein Blick aufs Display.
Der eigentliche Gewinn ist aber ein anderer: **es ist der einzige Modus, in dem
Lernen beim Gehen, Kochen oder Pendeln stattfinden kann.**

| Befehl (Beispiele) | Wirkung |
| --- | --- |
| „wiederhole" / „nochmal" | letzten Satz erneut |
| „langsamer" / „schneller" | Tempo in Stufen |
| „übersetze" | letzten Satz übersetzt vorlesen |
| „was heißt *X*?" | Einzelwort erklären |
| „merken" / „Karte" | letzten Satz + Wort als Karte vormerken |
| „was war das?" | Transkript des letzten Satzes vorlesen (buchstabiert) |
| „weiter" | fortsetzen |

Vier harte Anforderungen, sonst ist es unbenutzbar:

1. **Reaktion in unter einer Sekunde.** Ein Sprachbefehl, der drei Sekunden
   denkt, wird nie wieder benutzt.
2. **Befehlserkennung in der Muttersprache** — der Lernende soll seine kognitive
   Kapazität nicht für die Bedienung ausgeben. (Später optional in der
   Zielsprache als eigene Übung.)
3. **Feste Befehlsliste, keine offene Konversation.** Erkennung eines kleinen
   Vokabulars ist zuverlässig und offline möglich; freies Sprachverstehen ist
   es nicht.
4. **Bildschirmfreier Betrieb muss vollständig sein.** Wenn irgendein Befehl
   einen Blick aufs Display erfordert, bricht das gesamte Nutzungsszenario.

### Buttons statt Sprache

Dieselben Funktionen als große Flächen — auch im Sperrbildschirm und, wenn
möglich, auf Kopfhörer- und Uhrentasten. Sprachsteuerung ist im Bus oder im
Büro unbrauchbar. **[D]** Beide Wege müssen dieselbe Funktionsmenge abdecken;
Sprache ist eine Zugangsart, kein Funktionsumfang.

### Was das Hören zurückgibt

- Wörter, bei denen „wiederhole" mehrfach kam → Kandidatenkarten. Ein
  Verhaltenssignal für Nicht-Verstehen, das man sonst nie bekommt.
- Hörzeit auf Stufe 1 → Ebene-1-Messgröße für Hören ([03](03-level-modell.md)).
- Stellen mit hoher Rücksprungdichte → dort ist der Text zu schwer; das
  kalibriert die Abdeckungsschätzung nach.

---

## Narrow Listening / Narrow Reading **[B]**

Ein unterschätztes Prinzip: mehrere Texte zum **gleichen Thema** hintereinander.
Das Vokabular wiederholt sich von selbst, das Weltwissen aus Text 1 trägt Text 2,
und die empfundene Schwierigkeit fällt spürbar, obwohl das Material nicht
leichter wird. Für Lernende ist das ein starkes Erfolgserlebnis, und es kostet
uns nur eine Sortierregel.

**Für uns:** Inhalte kommen in thematischen Serien von 4–6 Stück, nicht als
zusammenhanglose Liste.

---

## Was in ein Spec muss

- Der Abdeckungsrechner (Tokenisierung → Lemmatisierung → Abgleich mit
  Kartenbestand). Pro Sprache verschieden, und für morphologiereiche Sprachen
  nicht trivial.
- Der Zustand des Hörers (spielt / pausiert / erklärt / wartet auf Befehl) mit
  Übergangstabelle — ein Lehrbuchfall für [`../STATE.md`](../STATE.md).
- Der Transkript-Synchronisationsvertrag: Wortzeitstempel oder Satzzeitstempel?
  Das entscheidet, ob „wiederhole" satzgenau funktioniert.
