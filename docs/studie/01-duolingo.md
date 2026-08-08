# 01 · Duolingo: was funktioniert, was nicht, und warum

Duolingo ist der Maßstab, an dem diese App gemessen wird — nicht weil es die
beste Lernmethode ist, sondern weil es die einzige ist, die Millionen Menschen
freiwillig täglich benutzen. Das ist eine echte Leistung, und wer sie ignoriert,
baut eine korrektere App, die niemand öffnet.

Die Kritik in diesem Kapitel ist deshalb nach einem Prinzip sortiert:
**erst das, was wir übernehmen, dann das, was wir anders machen.** Wer nur die
Schwächenliste liest, zieht die falsche Lehre.

---

## Teil 1: Die Stärken — nicht verhandelbar zu kopieren

### S1 · Die Einstiegshürde ist praktisch null **[A]**

Kein Kaufakt, kein Einstufungstest, kein Lehrbuch, keine Entscheidung über
Methodik. Man tippt auf „Spanisch" und lernt zwanzig Sekunden später. Jeder
Schritt, den wir zwischen „App geöffnet" und „erste Übung" legen, kostet einen
Teil der Nutzer für immer.

**Für uns:** Der Einstufungstest ([03](03-level-modell.md)) darf **nicht** vor
der ersten Übung stehen. Erst lernen, dann einstufen — oder besser: das Lernen
*ist* die Einstufung.

### S2 · Sitzungen sind kurz und haben ein sichtbares Ende **[A]**

Eine Lektion dauert 2–5 Minuten und man sieht von Anfang an, wie weit es noch
ist. Das ist der Unterschied zwischen „ich mache noch schnell eine Lektion" und
„ich müsste mal wieder Vokabeln lernen". Das Zielgradienten-Prinzip — Aufwand
steigt, je sichtbarer das Ende — ist einer der robustesten Motivationsbefunde
überhaupt.

**Für uns:** Jede Übungseinheit hat eine feste, im Voraus sichtbare Länge. Ein
SRS-Stapel mit „347 fällige Karten" ist genau das Gegenteil und der Hauptgrund,
warum Anki-Nutzer aussteigen (siehe [04](04-karteikarten-srs.md), „Die
Rückstandsfalle").

### S3 · Es entscheidet für dich **[B]**

Duolingo fragt nie „welche Wörter willst du lernen?". Für Anfänger ist das ein
Segen: die Entscheidungslast ist der Punkt, an dem Selbstlernprojekte
sterben. Anki ist mächtiger und deshalb für die meisten unbenutzbar — man muss
erst Kartendesign lernen, bevor man Spanisch lernen kann.

**Für uns:** Voreinstellungen müssen tragen, ohne dass jemand sie versteht.
Konfigurierbarkeit ist eine Belohnung für Fortgeschrittene, keine Voraussetzung.
Das ist auch das Gegengift gegen die typische Karteikarten-App: wir liefern
**fertige, frequenzsortierte Kartensätze pro Level mit**, statt den Nutzer
leere Stapel füllen zu lassen.

### S4 · Übung ist standardmäßig produktiv, nicht rezeptiv **[A]**

Duolingo lässt tippen, nicht ankreuzen — jedenfalls oft genug. Das ist
lernpsychologisch die richtige Entscheidung und in vielen Konkurrenzprodukten
schlechter gelöst. Multiple-Choice-Erkennung überschätzt das tatsächliche Wissen
gegenüber Lückentests deutlich (Größenordnung ~20 %, siehe
[02](02-evidenz.md), E3).

**Für uns:** Produktion ist die Standardaufgabe, Erkennung nur eine
Einstiegsstufe für ganz neue Karten.

### S5 · Es misst sich selbst öffentlich **[B]**

Duolingo veröffentlicht Wirksamkeitsstudien. Die bekannteste (Jiang et al. 2021)
berichtet, dass Lernende nach den ersten fünf Einheiten Spanisch oder Französisch
im **Lesen und Hören** auf einem Niveau lagen, das mit vier Semestern
US-Universitätsunterricht vergleichbar ist.

Das ist ein echtes Ergebnis — und es hat vier Einschränkungen, die man dazusagen
muss, weil sie exemplarisch für das ganze Feld sind:

1. Durchgeführt von internen Forschern mit externer Mitautorenschaft.
2. **Kein Vortest** — die Ausgangskompetenz ist selbstberichtet, nicht gemessen.
3. Nur **rezeptive** Fertigkeiten. Sprechen und Schreiben wurden nicht getestet.
4. Gemessen wurden Menschen, die die Einheiten **abgeschlossen** haben. Das ist
   die erfolgreichste Teilgruppe; die Abbrecher tauchen in der Zahl nicht auf.

**Für uns:** Wir übernehmen die Praxis (sich selbst messen), aber mit Vortest und
inklusive der Abbrecher. Siehe [11](11-roadmap-offene-fragen.md), „Wie wir
wissen, ob die App wirkt".

---

## Teil 2: Die Schwächen

### D1 · Optimiert wird Rückkehr, nicht Kompetenz **[A — strukturell]**

Das ist der Kernbefund, und alle folgenden Punkte sind Symptome davon. Streak,
XP, Ligen und Push-Nachrichten sind Metriken für *Sitzungshäufigkeit*. Keine
davon steht in einem nachgewiesenen Verhältnis zu Sprachkompetenz. Ein Nutzer
mit 900 Tagen Streak und 20 Sekunden pro Tag hat eine perfekte Metrik und kann
kein Spanisch.

Die qualitative Studie von Mogavi et al. (2022, ACM Learning@Scale) — neun Jahre
Forenanalyse plus 15 Interviews — nennt das **„gamification misuse"**: Nutzer
fixieren sich auf die Spielmechanik und werden vom Lernen *abgelenkt*. Als
Treiber identifiziert sie Wettbewerbsdruck, übermäßige Verspieltheit und
Herdenverhalten; als verstärkende Faktoren Zwang („compulsion") und empfundene
Unfairness.

Die konkreten Verhaltensweisen, die daraus folgen, kennt jeder Nutzer:

- Die leichteste Lektion mehrfach wiederholen, weil sie XP pro Minute maximiert.
- „Streak Freeze" kaufen statt lernen — die Metrik wird direkt gekauft.
- Fortschritt vermeiden, weil neue Inhalte die Fehlerquote und damit die
  Liga-Platzierung senken. **Das System bestraft Lernen.**

> **Konsequenz für uns:** Jede Zahl, die wir prominent anzeigen, wird optimiert
> werden. Also darf prominent nur stehen, was zu optimieren dem Lernen nützt.
> Kein Streak an erster Stelle. Siehe [08](08-motivation.md).

### D2 · Der Übungsplan ist ein Pfad, kein Gedächtnismodell **[A]**

Duolingo wiederholt Material, aber die Reihenfolge ergibt sich primär aus der
Kursstruktur und aus internen Heuristiken, nicht aus einem pro Karte gepflegten
Gedächtnismodell mit erklärbarem Zeitpunkt. Der Nutzer kann nicht sehen, *warum*
ein Wort jetzt drankommt, wann es wiederkommt, oder was er eigentlich stabil
kann.

Für ein Produkt, dessen einziger dauerhafter Nutzen „ich vergesse es nicht" ist,
ist das die teuerste Auslassung. Ein Gedächtnismodell, das man ansehen kann, ist
der zentrale Unterschied dieser App. Siehe [04](04-karteikarten-srs.md).

### D3 · Zu wenig Kontext und zu wenig Erklärung **[B]**

Ein wiederkehrender Befund der Forschungsliteratur (u. a. Van Deusen-Scholl &
Friend 2019): Duolingo liefert nicht genug Kontext oder Erklärung, damit
Lernende ein neues Konzept wirklich verstehen. Grammatik erscheint implizit,
über Musterexposition — und genau dort ist die Evidenz gegen den impliziten
Ansatz am deutlichsten: Norris & Ortega (2000) und Nachfolgemetaanalysen finden
**expliziten Unterricht wirksamer als impliziten**, mit haltbaren Effekten.

Der zweite Teil des Problems sind die Sätze selbst. Isolierte, oft absurde
Sätze („Der Bär trinkt Bier") sind gut memorierbar, aber sie bauen keine
Erwartung darüber auf, wie die Sprache tatsächlich verwendet wird. Es fehlt
zusammenhängender Diskurs — und damit genau das Material, aus dem Hörverstehen
und Lesegeschwindigkeit entstehen.

**Für uns:** Grammatik bekommt kurze, explizite Erklärungen *auf Abruf* am
Fehlerpunkt (nicht als Vorlesung vorweg), und der Input besteht aus
zusammenhängenden Texten, nicht aus Satzkonfetti. Siehe [05](05-input-lesen-hoeren.md)
und [07](07-offline-papier.md).

### D4 · Kaum echte Produktion, und Aussprachefeedback, dem man nicht trauen kann **[B]**

Sprechen bei Duolingo heißt: einen vorgegebenen Satz nachsprechen und eine
binäre Rückmeldung bekommen. Loewen & Sato (2018) fanden die Spracherkennung
ungenau genug, dass sie die Aussprachebildung eher behindert. Ungenaues
Aussprachefeedback ist schlimmer als keines: es bestätigt Fehler und
untergräbt das Vertrauen in alle anderen Rückmeldungen der App.

Freie Produktion — einen eigenen Gedanken formulieren, scheitern, korrigiert
werden — findet praktisch nicht statt. Das ist die Fertigkeit, wegen der die
meisten Leute überhaupt eine Sprache lernen.

**Für uns:** Lieber ehrliche Unsicherheit („das war schwer zu verstehen,
nochmal?") als eine grüne Häkchen-Lüge. Siehe [06](06-produktion.md).

### D5 · Kein Modell davon, wo der Lernende steht **[A]**

Duolingo zeigt XP, Kroneneinheiten und einen Kursfortschritt. Nichts davon
beantwortet die Frage, die jeder Lernende tatsächlich hat: *Welches Niveau habe
ich, und werde ich besser?* Der Kursfortschritt misst zurückgelegten Inhalt, und
Inhalt, den man durchlaufen hat, ist nicht Inhalt, den man kann.

**Für uns:** Das ist der Kern deiner Idee und der zweite große Unterschied.
Siehe [03](03-level-modell.md).

### D6 · Der Inhalt schrumpft, während die Spielschicht wächst **[C — Verlauf]**

Über die Jahre sind erklärende und gemeinschaftliche Teile weggefallen
(Diskussionsforen zu Sätzen, „Immersion", ausführliche Grammatiknotizen bei
gleichzeitigem Ausbau von Ligen, Truhen, Herzen und Wetten. Das ist keine
Ungeschicklichkeit, sondern die konsequente Folge von D1: gemessen wird
Rückkehr, also wächst, was Rückkehr erzeugt.

Seit 2024/25 kommt die Content-Erzeugung per KI dazu. Duolingo kündigte im April
2025 eine „AI-first"-Strategie an; im Memo hieß es, man könne nicht warten, bis
die Technologie perfekt sei, und müsse „gelegentlich kleine Qualitätseinbußen"
in Kauf nehmen. Zuvor war bereits rund ein Zehntel der Auftragskräfte —
überwiegend Übersetzer und Aufgabenautoren — abgebaut worden. Nach heftiger
Reaktion ruderte das Unternehmen kommunikativ zurück.

**Für uns:** Wir werden KI-generierte Inhalte verwenden — anders ist Material auf
jedem Level für jede Sprache nicht finanzierbar. Aber die Lehre aus D6 ist, dass
das eine **Qualitätspflicht** erzeugt, keine Einsparung: generierte Sätze und
Texte brauchen eine automatische Prüfung gegen Frequenz- und Levelkriterien und
einen sichtbaren Meldeweg für Fehler. Siehe [10](10-antipatterns.md), A5.

### D7 · Ein Kurs für alle Ausgangssprachen und alle Ziele **[C]**

Duolingos Kurse sind weitgehend sprachpaar-unabhängig konstruiert. Für einen
deutschen Muttersprachler, der Italienisch lernt, sind aber ganz andere Dinge
schwer als für einen englischen. Und jemand, der in drei Monaten in Rom arbeiten
wird, braucht anderes Vokabular als jemand, der Dante lesen will.

**Für uns:** Zumindest die Kartenauswahl sollte an ein Ziel koppelbar sein
(Reise / Beruf / Prüfung / Lektüre). Das ist billig, weil es nur eine andere
Frequenzliste ist. Siehe [09](09-feature-katalog.md), F14.

---

## Die Zusammenfassung in einem Satz

Duolingo hat das Verhaltensproblem gelöst (Leute kommen wieder) und das
Lernproblem offen gelassen (sie kommen wieder, um Punkte zu holen). Diese App
versucht, die Verhaltenslösung zu übernehmen und die Belohnung an **gemessene
Kompetenz** statt an Aktivität zu hängen — das ist die gesamte Produktidee in
einem Satz, und alles Weitere ist die Ausführung.
