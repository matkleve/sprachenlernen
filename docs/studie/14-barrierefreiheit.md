# 14 · Barrierefreiheit

Die Lücke, die [quellen.md](quellen.md) selbst benannt hat. Sie ist hier
nachgetragen, weil [`../CONSTITUTION.md`](../CONSTITUTION.md) §3
Barrierefreiheit zur Anforderung und nicht zur Phase erklärt — und weil eine App,
deren Kern Audio und Text sind, hier mehr zu entscheiden hat als eine
gewöhnliche Oberfläche.

Wichtig: Das ist **nicht** dasselbe wie WCAG-Konformität. Kontrast, Tastatur und
Fokus prüft `npm run verify` bereits. Dieses Kapitel handelt von etwas anderem —
davon, dass mehrere Kernmechanismen dieser App eine Fertigkeit voraussetzen, die
nicht jeder Nutzer hat.

---

## Der Kernkonflikt

| Mechanismus | Setzt voraus |
| --- | --- |
| Karteikarten mit Tippen | flüssiges Lesen und Schreiben |
| Abdeckungsbasierte Textauswahl | Lesen als Hauptzugang |
| Hörbuch mit Transkript | Hören |
| Diktat | Hören **und** Schreiben |
| HVPT ([13](13-aussprache-hoerwahrnehmung.md)) | Hören feiner Kontraste |
| Sprachbefehle | Sprechen, und verstanden werden |
| Levelmodell | dass all das oben Daten liefert |

Fällt eine dieser Fertigkeiten aus, bricht nicht nur eine Funktion weg — das
**Levelmodell misst dann falsch**. Ein gehörloser Nutzer hätte in
[03](03-level-modell.md) dauerhaft ein niedriges Hörlevel und damit ein
gedrücktes Gesamtlevel, obwohl seine Sprachkompetenz das nicht hergibt. Das ist
kein Darstellungsfehler, sondern ein Rechenfehler.

> **Produktregel [D]:** Das Fertigkeitsprofil ist **konfigurierbar**. Wer eine
> Fertigkeit abwählt, bekommt sie als „nicht Teil deines Profils" angezeigt, und
> das Gesamtlevel wird aus den verbleibenden gebildet.
>
> Der genaue Status und die Formel für weniger als vier Fertigkeiten stehen in
> [03](03-level-modell.md), „Der Status einer Fertigkeit" — **dort und nur
> dort**. „Nicht im Profil" ist ausdrücklich etwas anderes als „nicht gemessen":
> das eine ist eine Entscheidung, das andere eine Lücke.

---

## Legasthenie **[B]**

Die häufigste relevante Voraussetzung und die mit dem stärksten Bezug zum
Fremdsprachenlernen: Schwierigkeiten in der Erstsprache sagen Schwierigkeiten in
der Fremdsprache gut voraus, weil beide auf phonologischer Verarbeitung beruhen.

Die belegte Antwort ist **multisensorischer, strukturierter, expliziter
Sprachunterricht** (MSL). Studien mit Risikolernenden im Fremdsprachenunterricht
finden Gewinne in Phonologie, Wortschatz, verbalem Gedächtnis und
Fremdsprachenaptitude. Zwei Dinge daran sind bemerkenswert:

1. **Explizit und strukturiert** wirkt hier besonders stark — dieselbe Richtung
   wie [02](02-evidenz.md), E5, nur ausgeprägter.
2. Es nützt nicht nur der Zielgruppe. Das ist der übliche Befund bei
   Barrierefreiheit: die Anpassung wird zur allgemeinen Verbesserung.

**Was daraus folgt — und was ausdrücklich nicht:**

| Tun | Nicht tun |
| --- | --- |
| Schriftart, Zeilenabstand, Zeilenlänge, Hintergrundton einstellbar machen | Eine „Legasthenie-Schriftart" als Lösung verkaufen — die Evidenz dafür ist schwach |
| Audio zu **jedem** Text, immer, nicht nur bei Hörinhalten | Lesen als einzigen Weg zu einer Karte lassen |
| Reading-while-listening als Voreinstellung anbieten ([02](02-evidenz.md), E11) | Zeitdruck in Abrufaufgaben einbauen |
| Explizite Laut-Schrift-Zuordnung als eigener Inhalt | Rechtschreibung stillschweigend in die Wortschatzmessung mischen |
| Karten wahlweise mündlich beantworten | |

Der letzte Punkt links ist der wichtigste und er kostet fast nichts: **Tippen
darf nicht der einzige Weg sein, eine Abrufaufgabe zu beantworten.** Sprechen
oder Auswählen muss gleichwertig zählen — sonst misst die App Rechtschreibung
und nennt es Wortschatz.

---

## Hörbeeinträchtigung

Der Fall, der die Architektur am stärksten betrifft, weil zwei ganze Kapitel
([05](05-input-lesen-hoeren.md) Hörteil, [13](13-aussprache-hoerwahrnehmung.md))
wegfallen.

- Fertigkeitsprofil ohne Hören (siehe Produktregel oben).
- **Transkript ist Pflichtinhalt, nicht Zusatz.** Jedes Audio hat eines —
  das ist ohnehin schon so ([05](05-input-lesen-hoeren.md)), und es ist hier der
  Grund dafür, dass diese Entscheidung nicht verhandelbar wird.
- Hörabruf-Karten werden im Profil abgeschaltet, ohne dass die zugehörigen
  Wörter als „schwach" gelten.
- Bei Restgehör: Frequenzgang und Tempo sind Einstellungen, nicht Fixwerte.
- **Offene Frage [D]:** Gebärdensprachen sind eigenständige Sprachen mit eigener
  Grammatik. Sie hier zu behandeln wäre ein anderes Produkt, und so zu tun, als
  sei es eine Anpassung, wäre respektlos. Ausdrücklich außerhalb des Umfangs.

---

## Sehbeeinträchtigung

Der günstigste Fall, weil die App ohnehin einen vollständig bildschirmfreien
Modus braucht ([05](05-input-lesen-hoeren.md), Sprachbefehle) — hier zahlt sich
eine Entscheidung aus, die aus einem ganz anderen Grund getroffen wurde.

- Screenreader-Vollständigkeit für alle Kernabläufe, nicht nur Navigation.
  Insbesondere die Anzeigen aus [03](03-level-modell.md) und
  [04](04-karteikarten-srs.md): eine Fortschrittskurve und ein
  Wortschatz-Atlas müssen eine textliche Entsprechung haben, sonst ist die
  Kerninformation der App exklusiv visuell.
- Braille-Ausgabe funktioniert nur, wenn Inhalt echter Text ist. **Keine
  Vokabeln in Bildern**, kein Text in Grafiken.
- Der Papierteil ([07](07-offline-papier.md)) fällt weg oder wird zum
  reinen Audioteil (Ü4).

---

## Weitere Konstellationen, kurz

| | Anpassung |
| --- | --- |
| **Motorische Einschränkung** | Große Ziele, keine Wischgesten als einziger Weg, kein Zeitdruck, Sprachsteuerung als vollwertige Alternative |
| **ADHS / Aufmerksamkeit** | Kurze Einheiten mit sichtbarem Ende gibt es schon (S2); zusätzlich: Reizarmut abschaltbar, keine automatisch startenden Animationen, Pausenmodus ohne Strafe (F78) |
| **Angst vor Sprechen** | Siehe [16](16-weitere-befunde.md) — Schreiben ist der asynchrone Weg, und der Gesprächspartner hat keinen Zuhörer |
| **Ältere Lernende** | Schriftgrößen, Kontrast, langsameres Standardtempo bei Audio. Die Verteilungs- und Abrufeffekte gelten altersübergreifend |

---

## Was das für den Prozess heißt

`npm run verify` prüft Kontrast und Tastaturbedienbarkeit. Es prüft **nicht**,
ob eine Funktion einen alternativen Zugangsweg hat. Das ist eine
Spec-Anforderung, keine Gate-Anforderung:

> **[D]** Jedes Spec, das eine Aufgabe mit einer Fertigkeit verknüpft (hören,
> lesen, schreiben, sprechen), benennt den alternativen Weg — oder begründet in
> einem Satz, warum es keinen gibt.

Das ist billig, wenn es beim Schreiben des Specs passiert, und sehr teuer
danach: die Alternativwege nachzurüsten heißt, das Aufgabenmodell aus
[04](04-karteikarten-srs.md) aufzubohren, nachdem Nutzerdaten daran hängen.
