# CBOR für GemStone/S

Eine Implementierung von **CBOR** (Concise Binary Object Representation, [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949)) für GemStone/S 64.

- Encoder und Decoder für alle CBOR-Major-Types, auch Strings, Arrays und Maps unbestimmter Länge
- Floats in der kürzesten exakten Form (Half, Single oder Double), inklusive ±Infinity, NaN und -0.0
- Deterministische Codierung nach RFC 8949, Abschnitt 4.2.1 (sortierte Map-Schlüssel)
- Ganzzahlen beliebiger Größe (Bignums, Tag 2/3)
- Eingebaute Tags für Datum und Zeit, Dezimalbrüche, rationale Zahlen und Mengen
- CBOR-Sequenzen (RFC 8742)
- Robustes Decodieren: Jede fehlerhafte Eingabe löst `CborError` aus, die Verschachtelungstiefe ist begrenzt
- 37 SUnit-Tests, unter anderem mit den Testvektoren aus RFC 8949, Anhang A

## Installation

Die Bibliothek liegt als Topaz-Fileout in `src/CborLibrary.gs`. Sie legt das Symbol-Dictionary `CborLibrary` in der Symbol-Liste des aktuellen Benutzers an, falls es noch nicht existiert, und installiert die Klassen dort.

```
topaz 1> login
topaz 1> input src/CborLibrary.gs
topaz 1> commit
```

Die Datei kann mehrfach geladen werden. Vor dem Neuladen werden die vorhandenen Methoden der Klassen entfernt.

## Schnellstart

```smalltalk
| bytes value |
bytes := Cbor encode: #(1 'zwei' 3.5 true nil).
Cbor hexFromBytes: bytes.
"=> '8501647a776569f94300f5f6'
    85 Array mit 5 Elementen, 01, 64 'zwei', f9 4300 = 3.5, f5 true, f6 null"

value := Cbor decode: bytes.
"=> #(1 'zwei' 3.5 true nil)"
```

Die Hilfsmethoden `Cbor hexFromBytes:` und `Cbor bytesFromHex:` erleichtern das Debuggen und den Vergleich mit Werkzeugen wie [cbor.me](https://cbor.me):

```smalltalk
Cbor decode: (Cbor bytesFromHex: 'a2 61 61 01 61 62 82 02 03').
"=> a Dictionary('a'->1, 'b'->#(2 3))"
```

## Abbildung der Typen

### Encodieren (Smalltalk → CBOR)

| Smalltalk | CBOR |
|---|---|
| `nil`, `true`, `false` | `null`, `true`, `false` |
| `Integer` | Major Type 0/1; außerhalb von 64 Bit als Bignum (Tag 2/3) |
| `Float`, `SmallDouble` (`BinaryFloat`) | Float in der kürzesten exakten Form |
| `ScaledDecimal` | Dezimalbruch (Tag 4) |
| Brüche (`Fraction`, `SmallFraction`) | rationale Zahl (Tag 30) |
| andere `Number` | mit `asFloat` umgewandelt |
| `String`, `Symbol`, `Unicode7/16/32`, `DoubleByteString`, `QuadByteString`, `Utf8`, `Utf16`, `Character` | Text-String (UTF-8) |
| `ByteArray` | Byte-String |
| `DateAndTime` | Unix-Sekunden (Tag 1) |
| Objekte, die `cborEncodeOn:` verstehen | eigene Codierung (siehe unten) |
| Dictionaries (`AbstractDictionary`) | Map |
| `Array`, `OrderedCollection` (`SequenceableCollection`) | Array |
| `Set`, `IdentitySet` | Menge (Tag 258) |

Jedes andere Objekt löst `CborError` aus.

### Decodieren (CBOR → Smalltalk)

| CBOR | Smalltalk |
|---|---|
| Ganzzahl, Bignum (Tag 2/3) | `Integer` |
| Float (16, 32 und 64 Bit) | `Float` / `SmallDouble` |
| Byte-String | `ByteArray` |
| Text-String | `String` / `DoubleByteString` / `QuadByteString` (Option: Unicode-Klassen) |
| Array | `Array` |
| Map | `Dictionary` (Klasse einstellbar) |
| `null`, `true`, `false` | `nil`, `true`, `false` |
| `undefined` | `CborSimpleValue undefined` |
| andere Simple Values | `CborSimpleValue` |
| Tag 0 (RFC-3339-String) | `DateAndTime` mit dem Offset aus dem String |
| Tag 1 (Unix-Sekunden) | `DateAndTime` (UTC) |
| Tag 4 (Dezimalbruch) | `ScaledDecimal`, bzw. `Integer` bei positivem Exponenten |
| Tag 30 (rationale Zahl) | Bruch |
| Tag 258 (Menge) | `Set` |
| Tag 55799 (Self-Describe CBOR) | der enthaltene Wert |
| unbekannte Tags | `CborTag` (Tag-Nummer und Wert) |

## Beispiele

### Maps und deterministische Codierung

```smalltalk
| d |
d := Dictionary new.
d at: 'name' put: 'GemStone'; at: 'version' put: 3; at: 'tags' put: #('db' 'smalltalk').

Cbor encode: d.            "Reihenfolge der Schlüssel wie beim Iterieren des Dictionary"
Cbor encodeCanonical: d.   "Schlüssel bytewise sortiert: immer dieselben Bytes"
```

Mit `encodeCanonical:` erhält gleicher Inhalt immer dieselben Bytes. Das ist nötig, wenn das Ergebnis signiert, gehasht oder verglichen werden soll.

### Zahlen

```smalltalk
Cbor hexFromBytes: (Cbor encode: 1.5).              "=> 'f93e00'              (Half)"
Cbor hexFromBytes: (Cbor encode: 100000.0).         "=> 'fa47c35000'          (Single)"
Cbor hexFromBytes: (Cbor encode: 1.1).              "=> 'fb3ff199999999999a'  (Double)"
Cbor hexFromBytes: (Cbor encode: (2 raisedTo: 64)). "=> 'c249010000000000000000' (Bignum)"
Cbor hexFromBytes: (Cbor encode: 273.15s2).         "=> 'c48221196ab3'        (Tag 4)"
Cbor hexFromBytes: (Cbor encode: 1/3).              "=> 'd81e820103'          (Tag 30)"
```

Sollen Floats immer als 64-Bit-Double geschrieben werden:

```smalltalk
(CborEncoder new shortestFloats: false; encode: 1.5) contents.
"=> fb 3ff8000000000000"
```

### Datum und Zeit

```smalltalk
Cbor encode: DateAndTime now.     "Tag 1, Unix-Sekunden"

(Cbor decode: (Cbor bytesFromHex: 'c11a514b67b0')) asPosixSeconds.
"=> 1363896240  (2013-03-21T20:04:00Z)"

"Tag 0: RFC-3339-Strings werden einschließlich Zeitzonen-Offset ausgewertet"
Cbor decode: (Cbor encode: (CborTag tag: 0 value: '2013-03-21T22:04:00+02:00')).
```

### Tags

Unbekannte Tags kommen als `CborTag` zurück und werden beim Encodieren unverändert wieder geschrieben:

```smalltalk
| t |
t := Cbor decode: (Cbor bytesFromHex: 'd82076687474703a2f2f7777772e6578616d706c652e636f6d').
t tag.     "=> 32"
t value.   "=> 'http://www.example.com'"

Cbor encode: (CborTag tag: 32 value: 'https://gemtalksystems.com').
```

Eigene Umwandlung beim Decodieren mit `onTag:do:`. Ein so registrierter Block hat Vorrang vor der eingebauten Behandlung:

```smalltalk
| decoder |
decoder := CborDecoder onBytes: someBytes.
decoder onTag: 32 do: [:urlString | MyUrl fromString: urlString].
decoder onTag: 37 do: [:bytes | MyUuid fromBytes: bytes].
decoder decode.
```

### Eigene Klassen encodieren

Eine Klasse bestimmt ihre CBOR-Darstellung selbst, indem sie `cborEncodeOn:` implementiert. Das Argument ist der `CborEncoder`:

```smalltalk
Point >> cborEncodeOn: aCborEncoder
	"Als Tag 40001 mit dem Array [x, y] schreiben"
	aCborEncoder writeTag: 40001.
	aCborEncoder encode: (Array with: x with: y)
```

Das passende Gegenstück beim Decodieren:

```smalltalk
decoder onTag: 40001 do: [:pair | pair first @ pair last].
```

### Streaming und Werte unbestimmter Länge

Encoder und Decoder arbeiten auf beliebigen binären Streams:

```smalltalk
| ws rs |
ws := WriteStream on: ByteArray new.
Cbor encode: 'erster Wert' on: ws.
Cbor encode: 42 on: ws.

rs := ReadStream on: ws contents.
Cbor decodeFrom: rs.   "=> 'erster Wert'"
Cbor decodeFrom: rs.   "=> 42"
```

Mehrere hintereinander gespeicherte Werte (CBOR-Sequenz, RFC 8742):

```smalltalk
Cbor decodeSequence: (Cbor bytesFromHex: '0102f5').   "=> #(1 2 true)"
```

Werte unbestimmter Länge stückweise schreiben, z.B. wenn die Anzahl der Elemente vorher nicht bekannt ist:

```smalltalk
| e |
e := CborEncoder new.
e writeIndefiniteMapStart.
e encode: 'Fun'; encode: true.
e encode: 'Amt'; encode: -2.
e writeBreak.
Cbor hexFromBytes: e contents.   "=> 'bf6346756ef563416d7421ff'"
```

Weitere Methoden für die Low-Level-API: `writeArrayHeader:`, `writeMapHeader:`, `writeIndefiniteArrayStart`, `writeIndefiniteBytesStart`, `writeIndefiniteTextStart`, `writeTag:`, `writeSimple:`, `writeUndefined`.

### Decoder-Optionen

```smalltalk
| decoder |
decoder := CborDecoder onBytes: bytes.
decoder
	unicodeStrings: true;            "Text als Unicode7/16/32 statt String/DoubleByteString/QuadByteString"
	mapClass: KeyValueDictionary;    "Klasse für Maps (Standard: Dictionary)"
	rejectDuplicateKeys: true;       "doppelte Map-Schlüssel => CborError (Standard: letzter Wert gewinnt)"
	maxDepth: 64.                    "maximale Verschachtelung (Standard: 256)"
decoder decode.
```

### Fehlerbehandlung

Alle Fehler beim Encodieren und Decodieren sind Instanzen von `CborError` (Unterklasse von `Error`):

```smalltalk
[Cbor decode: untrustedBytes]
	on: CborError
	do: [:ex | Transcript showCr: 'Ungültiges CBOR: ', ex messageText. nil].
```

`CborError` wird unter anderem ausgelöst bei:
- abgeschnittenen Eingaben
- reservierten Codes
- ungültigem UTF-8
- falschen Inhalten in Tags 1–4, 30 und 258
- überzähligen Bytes nach dem Wert (bei `Cbor decode:`)
- zu tiefer Verschachtelung
- zyklischen Strukturen beim Encodieren
- Objekten, die sich nicht encodieren lassen

## Klassen

| Klasse | Aufgabe |
|---|---|
| `Cbor` | Fassade mit Klassenmethoden: `encode:`, `encodeCanonical:`, `encode:on:`, `decode:`, `decodeFrom:`, `decodeSequence:`, `bytesFromHex:`, `hexFromBytes:` |
| `CborEncoder` | schreibt CBOR auf einen binären WriteStream; Optionen `canonical:`, `shortestFloats:`, `maxDepth:` |
| `CborDecoder` | liest CBOR von einem binären ReadStream; Optionen siehe oben, eigene Tags mit `onTag:do:` |
| `CborTag` | Wert mit Tag (`tag`, `value`) |
| `CborSimpleValue` | Simple Value (`value`); `CborSimpleValue undefined` für `undefined` |
| `CborError` | Fehlerklasse |
| `CborTest` | SUnit-Tests |

## Tests

```smalltalk
CborTest suite run.   "37 Tests, alle grün"
```

## Hinweise

- **Verschachtelungstiefe:** Die Standardgrenze von 256 liegt bewusst unter dem Stack-Limit von GemStone (ca. 2000 Frames), weil jede Ebene mehrere Frames belegt.
- **Floats:** NaN wird immer als `f9 7e00` geschrieben. Ein NaN-Payload geht dabei verloren.
- **Mengen:** Beim Decodieren von Tag 258 entsteht ein `Set`. Ein `IdentitySet` wird zwar als Tag 258 geschrieben, kommt aber als `Set` zurück.
- **Datum:** `DateAndTime` wird als Unix-Sekunden (Tag 1) geschrieben. Der Zeitzonen-Offset geht dabei verloren, decodiert wird in UTC.
