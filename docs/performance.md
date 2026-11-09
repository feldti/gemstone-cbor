# Performance: CBOR und JSON in GemStone

## Messmethode

`CborBenchmark` (Paket `Cbor-Benchmarks`) codiert und decodiert fünf Datensätze. Jede Messung ist der **beste von 5 Läufen**, gemessen mit `System microsecondsToRun:`. JSON wird mit NeoJSON gemessen, sofern es im Image geladen ist.

```smalltalk
CborBenchmark new report.              "volle Größe"
(CborBenchmark scale: 1/10) report.    "kleiner, schneller"
```

| Datensatz | Inhalt |
|---|---|
| customers | 1000 Dictionaries mit String-Keys (Name, Id, Flag, eine Adresse, Zeitstempel), typisches JSON-Dokument |
| small ints | 10 000 Integer 0..999 |
| floats | 10 000 Floats, überwiegend 64 Bit, ein Viertel exakt als Half/Single darstellbar |
| strings | 2000 ASCII-Strings mit ca. 70 Zeichen |
| bytes 64K | ein `ByteArray` mit 65 536 Bytes (JSON kann das nur per base64, deshalb nicht verglichen) |

Gemessen im Entwicklungs-Stone (GemStone 3.7.5, Linux x86_64). Absolute Zahlen hängen von der Maschine ab. Aussagekräftig sind die Verhältnisse. Zwischen zwei Läufen schwanken die Werte um etwa ±10 %.

## Ergebnis

Zeiten in Millisekunden für den ganzen Datensatz.

| Datensatz | CBOR Bytes | JSON Bytes | CBOR enc | CBOR dec | NeoJSON enc | NeoJSON dec |
|---|---:|---:|---:|---:|---:|---:|
| customers | 103 630 | 142 643 | **7.1** | **9.1** | 16.4 | 31.9 |
| small ints | 27 178 | 38 893 | **2.3** | **2.1** | 2.4 | 12.0 |
| floats | 74 967 | 147 264 | **5.9** | **3.4** | 45.5 | 28.2 |
| strings | 136 896 | 138 894 | **0.9** | **0.8** | 17.3 | 23.4 |
| bytes 64K | 65 541 | – | 0.0 | 0.0 | – | – |

- **Decodieren** ist mit CBOR 3- bis 30-mal schneller als mit NeoJSON.
- **Encodieren** ist mit CBOR 2- bis 20-mal schneller. Bei Arrays aus kleinen Integern liegen beide gleichauf.
- **Größe:** CBOR ist 25–50 % kleiner, bei gleichen String-Keys. Mit Integer-Keys wie in `spec/types.cddl` wird der Abstand noch größer (siehe README).

## Optimierungen

Vorher/Nachher, in Millisekunden:

| Datensatz | enc vorher | enc nachher | dec vorher | dec nachher |
|---|---:|---:|---:|---:|
| customers | 9.8 | 7.1 | 17.7 | 9.1 |
| small ints | 3.8 | 2.3 | 3.6 | 2.1 |
| floats | 10.8 | 5.9 | 9.9 | 3.4 |
| strings | 1.3 | 0.9 | 10.8 | 0.8 |
| bytes 64K | 0.0 | 0.0 | 5.3 | 0.0 |

Was geholfen hat:

1. **Decoder direkt auf dem `ByteArray`** (`CborByteArrayDecoder`, von `CborDecoder onBytes:` und damit von `Cbor decode:` verwendet):
   - Er arbeitet mit Index statt Stream.
   - Byte-Strings und Text holt er per `copyFrom:to:`. Vorher hat `ReadStream>>next:` Byte für Byte kopiert, das kostete 5.3 ms für 64 KiB.
   - Mehrbyte-Zahlen und Floats liest er mit dem Primitive `at:signed:width:`.
   - Eine Längenangabe, die über das Ende der Eingabe hinausgeht, wird abgelehnt, bevor Speicher angelegt wird.
2. **Klassen-Identität vor `isKindOf:`:** `SmallInteger`, `String`, `Unicode7`, `SmallDouble`, `Array`, `Dictionary` und `ByteArray` werden mit `==` auf die Klasse erkannt. Nur andere Klassen laufen durch die allgemeine `isKindOf:`-Kette.
3. **Floats ohne LargeIntegers:** Das 64-Bit-Muster wird in zwei 32-Bit-Hälften zerlegt (`unsigned32At:`). Alle Rechnungen bleiben dadurch in SmallIntegers.
4. **SmallInteger ohne LargeInteger-Vergleich:** `writeInteger:` vergleicht SmallIntegers nicht mehr mit `2^64`. Werte 0..23 gehen direkt als ein Byte raus, 1- und 2-Byte-Argumente ohne Schleife.
5. **UTF-8 ohne Kopie:** Das `Utf8`-Objekt aus `encodeAsUTF8` wird direkt in den Stream geschrieben, ohne `asByteArray`.
6. **Tiefenprüfung nur bei Containern:** Früher hat `encode:` für *jeden* Wert die Verschachtelungstiefe hoch- und wieder heruntergezählt. Jetzt geschieht das nur in `writeArray:`, `writeMap:`, `writeSet:` und bei Objekten, die sich selbst codieren (`cborEncodeOn:`, Registry). Nur dort kann eine Rekursion entstehen, und der Schutz vor zyklischen Strukturen bleibt erhalten. Gewinn: etwa 10 % bei allen Datensätzen.
7. **Integer direkt in der Array-Schleife:** `writeArray:` läuft mit `to:do:`, das der Compiler inline umsetzt. SmallInteger-Elemente von 0 bis 65 535 schreibt die Schleife selbst als 1, 2 oder 3 Bytes, ohne `encodeObject:` → `writeInteger:` → `writeHead:value:`. Damit sinkt die Zeit für Integer-Arrays von 3.5 auf 2.3 ms. Der `CborTypedEncoder` schaltet diesen Pfad ab, wenn `SmallInteger` in der Registry umdefiniert ist (Test `testRegistryOverridesSmallIntegersInArrays`).

Warum Integer überhaupt so lange langsam waren: Für eine Zahl wie 1234 (CBOR: `19 04 D2`) fielen rund ein Dutzend Methodenaufrufe an, die Bytes selbst sind trivial. NeoJSON schreibt dieselbe Zahl mit dem Primitive `printString` und einem einzigen `nextPutAll:`. Beim Decodieren ist es umgekehrt: JSON muss Ziffern in Smalltalk parsen, deshalb ist CBOR dort sechsmal schneller.

Was **nicht** geholfen hat: Ein eigener, verdoppelnder Schreibpuffer statt `WriteStream on: ByteArray new` war deutlich **langsamer**. Strings wurden dabei 6× langsamer encodiert, customers 60 %. GemStones `WriteStream` hängt per `ByteArray>>add:` an, und das ist intern effizienter als Smalltalk-Code mit `replaceFrom:to:with:startingAt:`. Der Versuch ist verworfen.

## Wo die verbleibende Zeit liegt

- **Stream-Aufrufe:** Jedes Byte geht durch `WriteStream>>nextPut:` (zwei Smalltalk-Methoden). Unterhalb davon ist ohne eigene Primitive nichts mehr zu holen. Ein eigener Puffer war langsamer, siehe oben.
- **Integer außerhalb von Arrays:** Integer als Map-Werte gehen weiter über `encodeObject:` → `writeInteger:`. Werte 0..23 sind dort schon ein Schnellpfad.
- **customers:** Den größten Teil kosten Map-Iteration und `Dictionary at:put:` beim Decodieren. Hier ist kaum noch etwas herauszuholen, ohne die Abbildung auf `Dictionary` aufzugeben.
- **`encodeCanonical:`** ist deutlich teurer als `encode:`. Jeder Map-Schlüssel wird separat codiert und die Schlüssel werden sortiert. Deterministische Codierung nur verwenden, wo sie gebraucht wird (Hashes, Signaturen, ETags).
- **Eigene Streams** (`CborDecoder on: aStream`) nutzen weiter den Stream-Pfad. Für beste Leistung erst die Bytes holen und dann `Cbor decode:` bzw. `CborDecoder onBytes:` verwenden.
