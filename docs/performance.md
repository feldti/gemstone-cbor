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
| customers | 103 630 | 142 643 | **7.6** | **9.4** | 17.4 | 32.0 |
| small ints | 27 178 | 38 893 | 3.5 | **2.1** | **2.4** | 12.2 |
| floats | 74 967 | 147 264 | **6.4** | **3.5** | 45.0 | 29.4 |
| strings | 136 896 | 138 894 | **0.9** | **0.8** | 18.2 | 24.3 |
| bytes 64K | 65 541 | – | 0.0 | 0.0 | – | – |

- **Decodieren** ist mit CBOR 3- bis 30-mal schneller als mit NeoJSON.
- **Encodieren** ist mit CBOR 2- bis 20-mal schneller. Die einzige Ausnahme sind Arrays aus kleinen Integern, dort ist NeoJSON etwas schneller (2.4 statt 3.5 ms).
- **Größe:** CBOR ist 25–50 % kleiner, bei gleichen String-Keys. Mit Integer-Keys wie in `spec/types.cddl` wird der Abstand noch größer (siehe README).

## Optimierungen

Vorher/Nachher, in Millisekunden:

| Datensatz | enc vorher | enc nachher | dec vorher | dec nachher |
|---|---:|---:|---:|---:|
| customers | 9.8 | 7.6 | 17.7 | 9.4 |
| small ints | 3.8 | 3.5 | 3.6 | 2.1 |
| floats | 10.8 | 6.4 | 9.9 | 3.5 |
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

Was **nicht** geholfen hat: Ein eigener, verdoppelnder Schreibpuffer statt `WriteStream on: ByteArray new` war deutlich **langsamer**. Strings wurden dabei 6× langsamer encodiert, customers 60 %. GemStones `WriteStream` hängt per `ByteArray>>add:` an, und das ist intern effizienter als Smalltalk-Code mit `replaceFrom:to:with:startingAt:`. Der Versuch ist verworfen.

## Wo die verbleibende Zeit liegt

- **Encodieren kleiner Integer:** Pro Wert fallen mehrere Methodenaufrufe an (`encode:`, `encodeObject:`, Stream). NeoJSON braucht hier ähnlich viele, schreibt aber in einen String-Stream. Ein spürbarer Gewinn wäre nur mit einer eigenen Array-Schleife für homogene Integer-Arrays möglich.
- **customers:** Den größten Teil kosten Map-Iteration und `Dictionary at:put:` beim Decodieren. Hier ist kaum noch etwas herauszuholen, ohne die Abbildung auf `Dictionary` aufzugeben.
- **`encodeCanonical:`** ist deutlich teurer als `encode:`. Jeder Map-Schlüssel wird separat codiert und die Schlüssel werden sortiert. Deterministische Codierung nur verwenden, wo sie gebraucht wird (Hashes, Signaturen, ETags).
- **Eigene Streams** (`CborDecoder on: aStream`) nutzen weiter den Stream-Pfad. Für beste Leistung erst die Bytes holen und dann `Cbor decode:` bzw. `CborDecoder onBytes:` verwenden.
