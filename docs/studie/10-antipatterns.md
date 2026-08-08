# 10 · Anti-Patterns: was wir bewusst nicht bauen

Die Ausschlussliste ist der billigste Teil einer Studie und der, der die meiste
Nacharbeit verhindert. Jeder Punkt nennt auch, **was er kostet** — eine
Ausschlussentscheidung ohne benannten Preis ist Selbstbetrug.

---

## A1 · Aktivitätsmetriken an prominenter Stelle

**Nicht:** Streak, XP, Minuten, Ligen als Hauptanzeige.
**Weil:** Was prominent angezeigt wird, wird optimiert. Aktivitätsmetriken lassen
sich billiger durch Aktivität als durch Lernen steigern — und dann optimieren
Nutzer rational an der Sprache vorbei ([01](01-duolingo.md), D1).
**Kostet uns:** Vermutlich Nutzungshäufigkeit. Duolingos Mechanik funktioniert
nachweislich; unsere Alternative ist begründet, aber unbewiesen
([08](08-motivation.md), Ehrlichkeitsvorbehalt).

## A2 · Fehler bestrafen

**Nicht:** Herzen, Leben, Sitzungsabbruch bei zu vielen Fehlern.
**Weil:** Ein Fehler beim Abrufversuch ist der Lernvorgang, nicht sein Scheitern
([02](02-evidenz.md), E1). Eine App, die Fehler bestraft, bringt Nutzer dazu,
leichtere Aufgaben zu wählen — also genau das Gegenteil von
[02](02-evidenz.md), E6.
**Kostet uns:** Ein Spannungselement. Fehlerfreiheit als Ziel ist emotional
befriedigend.

## A3 · Der Rückstandszähler

**Nicht:** „871 Karten überfällig."
**Weil:** Der häufigste Ausstiegsgrund bei SRS-Apps, und ein reines
Anzeigeproblem ([04](04-karteikarten-srs.md), Rückstandsfalle). Die Zahl
informiert nicht, sie beschämt.
**Kostet uns:** Nichts an Information — der Horizont (F03) zeigt dieselben Daten
in nützlicher Form. Aber Anki-Umsteiger werden die Zahl vermissen und danach
fragen.

## A4 · Ein einziger Fortschrittsbalken

**Nicht:** „Du bist zu 34 % durch den Spanischkurs."
**Weil:** Es misst zurückgelegten Inhalt, nicht Kompetenz. Zwei Nutzer mit
demselben Balken können ein Jahr auseinanderliegen. Und es hat ein Ende, was
falsch ist: nach dem Kurs kann man kein Spanisch.
**Kostet uns:** Eine sehr befriedigende Anzeige. Menschen mögen Balken, die
sich füllen; ein Levelprofil ist schwerer zu erfassen.

## A5 · Generierte Inhalte ohne Prüfung

**Nicht:** LLM-Texte, -Sätze und -Übersetzungen direkt an Lernende.
**Weil:** Der Lernende kann per Definition nicht beurteilen, ob der Zielsprachensatz
korrekt ist — das ist ja der Grund, warum er lernt. Ein falscher Satz wird mit
derselben Sorgfalt eingeprägt wie ein richtiger. Duolingos „AI-first"-Ankündigung
2025 sprach offen von in Kauf genommenen „kleinen Qualitätseinbußen"; für
generierte *Lerninhalte* ist das die falsche Abwägung
([01](01-duolingo.md), D6).
**Stattdessen:** Automatische Prüfung gegen Frequenz-, Level- und
Grammatikkriterien; Stichprobenkontrolle durch Muttersprachler pro Sprache;
sichtbarer Meldeweg in jedem Inhalt (F85); Herkunftskennzeichnung.
**Kostet uns:** Echte laufende Kosten. Das ist der teuerste Punkt dieser Liste
und der, an dem am ehesten gespart werden wird.

## A6 · Aussprachebewertung, der man nicht trauen kann

**Nicht:** ✓/✗ auf einen gesprochenen Satz.
**Weil:** Ungenaues Feedback ist schlimmer als keines — es bestätigt Fehler und
beschädigt das Vertrauen in alle anderen Rückmeldungen ([01](01-duolingo.md), D4).
**Kostet uns:** Eine Funktion, die sich in einer Demo gut macht.

## A7 · Übersetzung ohne Abrufversuch

**Nicht:** Antippen zeigt sofort die Übersetzung.
**Weil:** Ohne Abrufversuch findet kein Lernen statt ([02](02-evidenz.md), E1).
Die App würde zu einem angenehmen Wörterbuch mit Fortschrittsanzeige.
**Stattdessen:** kurze Verzögerung oder zweites Tippen (F34), abschaltbar.
**Kostet uns:** Etwas Bequemlichkeit, und die Bremse wird sich anfangs falsch
anfühlen.

## A8 · Grammatik als Kapitel vorweg

**Nicht:** „Lektion 4: Das Perfekt" als Pflichtstation vor der Übung.
**Weil:** Explizite Erklärung wirkt ([02](02-evidenz.md), E5) — aber am
Fehlerpunkt, wo eine offene Frage existiert. Vorweg ist sie Text, den niemand
liest.
**Kostet uns:** Struktur. Manche Lernende — besonders die schulisch geprägten —
wollen genau das und werden es vermissen. Kompromiss: verfügbar, aber nicht im
Weg.

## A9 · Einstufungstest vor der ersten Übung

**Nicht:** 10 Minuten Test, bevor irgendetwas gelernt wurde.
**Weil:** Die Einstiegshürde ist Duolingos größte Stärke ([01](01-duolingo.md),
S1). Ein Test ist eine Prüfungssituation als Begrüßung.
**Stattdessen:** Erst üben, Test danach anbieten; wer ihn überspringt, wird
laufend aus dem Verhalten eingestuft.
**Kostet uns:** Schlechtere Anfangskalibrierung für Fortgeschrittene, die
mühsame erste Sitzungen mit zu leichtem Material haben werden.

## A10 · Karteikarten als leere Hülle

**Nicht:** „Lege deine erste Karte an."
**Weil:** Genau hier scheitern Karteikarten-Apps. Kartendesign ist eine
erlernbare Fertigkeit, und niemand will sie erlernen, bevor er Spanisch lernt
([01](01-duolingo.md), S3).
**Kostet uns:** Redaktionsarbeit für die Startdecks pro Sprache (F07).

## A11 · Alles konfigurierbar machen

**Nicht:** Intervallmodifikatoren, Ease-Bonus, Lapse-Multiplikator im
Hauptmenü.
**Weil:** Ankis Mächtigkeit ist der Grund, warum die meisten Menschen es nicht
benutzen. Voreinstellungen müssen tragen, ohne verstanden zu werden.
**Kostet uns:** Die Power-User-Zielgruppe wird sich beschweren.
**Nicht zu verwechseln mit:** Sichtbarkeit. Der Zeitplan wird vollständig
*gezeigt* (F02, F03) — er ist nur nicht überall *einstellbar*. Zeigen und
einstellen lassen sind verschiedene Dinge, und die Verwechslung ist der Grund,
warum transparente Systeme oft überkonfiguriert enden.

## A12 · Sprachbefehle als Konversation

**Nicht:** freies Sprachverstehen zur Steuerung des Hörbuchs.
**Weil:** Eine feste, kleine Befehlsliste ist zuverlässig, schnell und offline
möglich; freies Verstehen ist keines davon. Und ein Befehl, der drei Sekunden
denkt, wird nie wieder benutzt ([05](05-input-lesen-hoeren.md)).
**Kostet uns:** Eine Demo-Wow-Funktion. Die Befehlsliste muss gelernt werden.

## A13 · Sprache als einziger Zugangsweg

**Nicht:** Funktionen, die es nur per Sprachbefehl gibt.
**Weil:** Sprachsteuerung ist im Bus, im Büro und in Gesellschaft unbenutzbar —
also in der Mehrzahl der realen Lernsituationen.
**Kostet uns:** Doppelte Umsetzung jeder Hörfunktion.

## A14 · Streak-Schutz verkaufen

**Nicht:** kaufbare Ausnahmen von der eigenen Metrik.
**Weil:** Eine Metrik, die man kaufen kann, misst nichts. Und es ist die
deutlichste denkbare Aussage darüber, wofür das Produkt optimiert.
**Kostet uns:** Eine erwiesenermaßen wirksame Einnahmequelle.

---

## Die Regel hinter allen vierzehn

> **Was angezeigt wird, wird optimiert. Also darf prominent nur stehen, was zu
> optimieren dem Lernen nützt.**

Das ist der Satz, gegen den jede neue Funktion geprüft wird. Er gehört als
Produktregel nach [`../CONSTITUTION.md`](../CONSTITUTION.md) — siehe
[11](11-roadmap-offene-fragen.md), Frage 8.
