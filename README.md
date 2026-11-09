# CBOR für GemStone/S

Eine Implementierung von **CBOR** (Concise Binary Object Representation, [RFC 8949](https://www.rfc-editor.org/rfc/rfc8949)) für GemStone/S 64.

- Encoder und Decoder für alle CBOR-Major-Types, auch Strings, Arrays und Maps unbestimmter Länge
- Floats in der kürzesten exakten Form (Half, Single oder Double), inklusive ±Infinity, NaN und -0.0
- Deterministische Codierung nach RFC 8949, Abschnitt 4.2.1 (sortierte Map-Schlüssel)
- Ganzzahlen beliebiger Größe (Bignums, Tag 2/3)
- Eingebaute Tags für Datum und Zeit, Dezimalbrüche, rationale Zahlen und Mengen
- CBOR-Sequenzen (RFC 8742)
- Robustes Decodieren: Jede fehlerhafte Eingabe löst `CborError` aus, die Verschachtelungstiefe ist begrenzt
- Typ-Registry: eigene Klassen zentral auf Tags oder Typnamen abbilden
- Gemeinsamer Datenvertrag für mehrere Sprachen: CDDL-Schema und sprachneutrale Testvektoren in `spec/`
- 60 SUnit-Tests, unter anderem mit den Testvektoren aus RFC 8949, Anhang A

## Installation

Es gibt zwei gleichwertige Wege. Beide enthalten denselben Code.

### Mit Metacello (Monticello-Pakete)

Für Images mit GLASS/GsDevKit, also mit Metacello und FileTree, z.B. aus `extent0.seaside.dbf`:

```smalltalk
Metacello new
	baseline: 'Cbor';
	repository: 'github://feldti/gemstone-cbor:main/repository';
	load.
```

Für einen lokalen Checkout lautet das Repository `'filetree:///pfad/zu/gemstone-cbor/repository'`. Getestet ist bisher nur dieser lokale Weg. Das direkte Laden über `github://` setzt voraus, dass der Stone GitHub erreicht.

| Paket | Inhalt |
|---|---|
| `Cbor-Core` | die Bibliothek |
| `Cbor-Tests` | SUnit-Tests und Beispielklassen (benötigt `Cbor-Core`) |

Gruppen der `BaselineOfCbor`:
- `default`: alles
- `Core`: nur die Bibliothek
- `Tests`: nur die Tests

Ohne Tests: `load: 'Core'`.

Monticello legt die Klassen in das Standard-Dictionary des Benutzers (üblicherweise `UserGlobals`), nicht in `CborLibrary`.

### Mit Topaz (Fileout)

Für jedes Image, auch ohne Monticello. Die Datei legt das Symbol-Dictionary `CborLibrary` in der Symbol-Liste des aktuellen Benutzers an, falls es noch nicht existiert, und installiert die Klassen dort.

```
topaz 1> login
topaz 1> input src/CborLibrary.gs
topaz 1> input src/CborVectorTest-vectors.gs
topaz 1> commit
```

`CborVectorTest-vectors.gs` enthält nur die generierten Testvektoren für `CborVectorTest` (siehe unten).

### Woher das Monticello-Repository kommt

Die Topaz-Fileouts in `src/` sind die Quelle. `repository/` wird daraus erzeugt:

```
python3 tools/fileout_to_filetree.py
```

Das Skript schreibt das FileTree-Repository mit den Paketen `Cbor-Core`, `Cbor-Tests` und `BaselineOfCbor` komplett neu. Nach jeder Änderung am Fileout muss es laufen. Die GitHub Action prüft das.

Die Versions-ID in `monticello.meta/version` wird aus dem Paketinhalt abgeleitet. Ohne diese Metadaten erzeugt der FileTree-Reader bei jedem Lesen eine neue zufällige ID. Metacello findet eine abgerufene Version dann im Cache nicht wieder, und das Laden scheitert mit `MetacelloPackageSpecResolutionError`.

Die Bibliothek braucht nur Kernel-Klassen und keine Zusatzpakete wie Grease, Seaside oder Rowan. Getestet:

| Version | Topaz-Fileout (frischer Kernel-Stone) | Metacello (frischer GLASS-Stone) |
|---|---|---|
| 3.7.5 | 60/60 (auch im Entwicklungs-Image) | 60/60 |
| 3.7.6 | 60/60 | 60/60 |
| 4.0.0.a5 | 60/60 | – (Produkt enthält keinen GLASS-Extent) |

### Test in einem frischen Stone

`tools/fresh-stone-test.sh` legt einen neuen Stone aus dem leeren `extent0.dbf` des Produkts an. Das Skript lädt beide Fileouts, lässt alle Testsuiten laufen und stoppt und löscht den Stone danach wieder. Mit `LOADER=metacello` nimmt es stattdessen `extent0.seaside.dbf` und lädt `BaselineOfCbor` per Metacello aus `repository/`. Der Stone läuft isoliert: eigener Name `cborfresh` und eigenes `GEMSTONE_GLOBAL_DIR`, andere Stones bleiben also unberührt.

```
tools/fresh-stone-test.sh <GemStone-Produktverzeichnis> [Keyfile] [Arbeitsverzeichnis]

# z.B.
tools/fresh-stone-test.sh ~/GemStone64Bit3.7.5-x86_64.Linux
#   CborTest: 37 run, 37 passed, 0 failures, 0 errors
#   CborTypeRegistryTest: 17 run, 17 passed, 0 failures, 0 errors
#   CborVectorTest: 6 run, 6 passed, 0 failures, 0 errors
#   TOTAL: 60 run, 0 not passed
```

Ohne Keyfile-Angabe wird `sys/community.starter.key` des Produkts verwendet. Mit `KEEP=1` bleibt das Arbeitsverzeichnis mit den Logs erhalten. Der Exit-Status ist 0, wenn alles grün ist.

Der Test im frischen Stone deckt Abhängigkeiten auf, die ein voll ausgebautes Entwicklungs-Image verdeckt. So fehlen im reinen 3.7.5-Kernel `isInteger`, `isNaN`, `Float nan` und `Float infinity`, und `Character>>digitValue` liefert für Hex-Buchstaben `nil`.

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

### Typ-Registry: Klassen zentral auf Tags abbilden

`cborEncodeOn:` und `onTag:do:` verteilen das Wissen, welche Klasse zu welchem Tag gehört, auf Klasse und Aufrufer. Mit `CborTypeRegistry` steht diese Zuordnung an einer Stelle. Die Registry liefert Encoder und Decoder, die beide Richtungen kennen.

**Registrierung über Selektoren** (für eigene Klassen): Instanzen implementieren `cborPayload`, die Klasse implementiert `fromCborPayload:`.

```smalltalk
Customer >> cborPayload
	| m |
	m := Dictionary new.
	m at: 1 put: name; at: 2 put: id.
	addresses isEmpty ifFalse: [m at: 3 put: addresses asArray].
	^m

Customer class >> fromCborPayload: aDictionary
	^self name: (aDictionary at: 1) id: (aDictionary at: 2)
		addresses: (aDictionary at: 3 ifAbsent: [#()])

registry := CborTypeRegistry new.
registry register: Customer tag: 40002.
registry register: Address tag: 40003.
```

**Registrierung über Blöcke** (für fremde Klassen, die man nicht ändern will):

```smalltalk
registry register: Point tag: 40001
	encode: [:p | Array with: p x with: p y]
	decode: [:a | a first @ a last].
```

**Benutzen:**

```smalltalk
bytes := registry encode: aCustomer.          "auch registry encodeCanonical:"
obj   := registry decode: bytes.              "=> ein Customer, Adressen als Address-Objekte"

encoder := registry newEncoderOn: aStream.    "für Streams"
decoder := registry newDecoderOn: aStream.
decoder unicodeStrings: true.                 "alle Decoder-Optionen bleiben verfügbar"
```

**Typnamen statt Tag-Nummern** (Tag 27, `[typeName, arg1, ...]`): `cborPayload` liefert die Argumentliste, `fromCborPayload:` bekommt sie als Array.

```smalltalk
registry register: CborTestPoint typeName: 'example.Point'.
Cbor hexFromBytes: (registry encode: (CborTestPoint x: 1 y: 2)).
"=> 'd81b836d6578616d706c652e506f696e740102'  = 27(['example.Point', 1, 2])"
```

Beim Decodieren werden nur registrierte Typnamen instanziiert. Die Registry wirkt damit als Whitelist. Unbekannte Namen kommen als `CborTag` zurück, es wird nie eine Klasse per Reflection aus den Daten erzeugt.

**Regeln:**
- **Klassen-Lookup:** Gesucht wird nach der exakten Klasse. Unterklassen müssen selbst registriert werden, sonst fällt der Encoder auf die eingebaute Abbildung zurück.
- **Vorrang:** Registrierte Klassen haben Vorrang vor der eingebauten Typbehandlung. Damit lassen sich auch Standardklassen anders abbilden.
- **Eindeutigkeit:** Eine Tag-Nummer oder ein Typname gehört genau zu einer Klasse. Doppelte Vergabe löst `CborError` aus. Registriert man dieselbe Klasse erneut, ersetzt das die alte Zuordnung. Tag 27 ist für Typnamen reserviert.
- **Unbekannte Tags** bleiben `CborTag` und werden unverändert wieder geschrieben.
- **Überschreiben:** Mit `onTag:do:` auf einem Decoder der Registry lassen sich einzelne Umwandlungen überschreiben.
- **Ohne Registry:** `Cbor encode:` und `Cbor decode:` bleiben bewusst ohne Registry.
- **Gemeinsame Default-Registry:** `CborTypeRegistry default` liefert eine gemeinsame, persistente Instanz. Dort am besten nur über Selektoren registrieren, denn Blöcke werden sonst mit dem Stone persistiert. Gleichzeitige Änderungen aus mehreren Sessions führen zu Commit-Konflikten. Die Registry daher beim Deployment füllen, nicht zur Laufzeit.

### Gemeinsamer Datenvertrag für mehrere Sprachen (`spec/`)

Wenn auch andere Sprachen die Daten lesen oder schreiben, gilt als Vertrag nicht der Code, sondern das Verzeichnis `spec/`:

| Datei | Inhalt |
|---|---|
| `spec/types.cddl` | Schema in CDDL (RFC 8610): Tag-Nummern, Felder, Pflicht/optional, Regeln für Erweiterungen |
| `spec/test-vectors.json` | gemeinsame Testvektoren: Hex-Bytes, Diagnostic Notation, CDDL-Regel, gültig/ungültig, Roundtrip ja/nein |
| `spec/generate_vectors.py` | erzeugt die Vektoren mit einem eigenen, abhängigkeitsfreien CBOR-Encoder |
| `spec/validate_vectors.py` | prüft die Vektoren mit dem CDDL-Referenzwerkzeug gegen das Schema |

Die Beispieltypen dort sind `point` (Tag 40001), `customer` (40002) und `address` (40003). In GemStone bilden die Testklassen `CborTestPoint`, `CborTestCustomer` und `CborTestAddress` sie ab.

**Vektoren erzeugen** (nach jeder Änderung an Schema oder Vektorliste):

```
python3 spec/generate_vectors.py
```

Das Skript schreibt `spec/test-vectors.json` und `src/CborVectorTest-vectors.gs`. Beide Dateien nicht von Hand ändern.

**Bedeutung der Felder** in `test-vectors.json`:
- `valid`: Das Element entspricht der CDDL-Regel `rule`.
- `roundtrip`: Decodieren in Fachobjekte und deterministisches Encodieren ergibt exakt `hex`. Bei `customer-extension` ist das bewusst `false`, weil Leser unbekannte Schlüssel ignorieren und sie dabei verloren gehen.

**Was jede Implementierung testen sollte:**
1. Gültige Vektoren decodieren zu den richtigen Fachobjekten.
2. Vektoren mit `roundtrip: true` ergeben nach Decodieren und Encodieren wieder dieselben Bytes.
3. Ungültige Vektoren werden abgelehnt, entweder mit einem Fehler oder zumindest nicht als Fachobjekt der Regel.
4. Unbekannte Schlüssel werden ignoriert.

In GemStone erledigt das `CborVectorTest`. Für Python, JavaScript & Co. liest die jeweilige Testsuite `spec/test-vectors.json` ein.

**CDDL-Validierung:** Das Skript `spec/validate_vectors.py` prüft alle Vektoren mit dem Referenzwerkzeug (Ruby-Gem `cddl`) gegen das Schema. Gültige Vektoren müssen bestehen, ungültige durchfallen.

```
gem install --user-install cddl      # einmalig
python3 spec/validate_vectors.py     # => 18/18 vectors agree with spec/types.cddl
```

Das Skript sucht `cddl` in `$CDDL`, im `PATH` und im RubyGems-Benutzerverzeichnis. Es endet mit Status 1, wenn ein Vektor nicht zum Schema passt, und eignet sich damit auch für CI.

Auf GitHub übernimmt das die Action `.github/workflows/cddl.yml`. Sie läuft bei jeder Änderung an `spec/` oder an den generierten Vektoren und prüft zweierlei:
1. Die eingecheckten Vektoren müssen dem entsprechen, was `generate_vectors.py` erzeugt. Sonst fehlt ein `python3 spec/generate_vectors.py` vor dem Commit.
2. `validate_vectors.py` muss für alle Vektoren mit dem Schema übereinstimmen.

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
| `CborTypeRegistry` | zentrale Zuordnung Klasse ↔ Tag bzw. Typname; liefert passende Encoder und Decoder |
| `CborTypeMapping` | eine einzelne Zuordnung in der Registry |
| `CborTypedEncoder` | Encoder, der vor der eingebauten Abbildung die Registry fragt |
| `CborError` | Fehlerklasse |
| `CborTest`, `CborTypeRegistryTest`, `CborVectorTest` | SUnit-Tests |
| `CborTestPoint`, `CborTestCustomer`, `CborTestAddress` | Beispielklassen für die Tests, abgebildet nach `spec/types.cddl` |

## Tests

```smalltalk
CborTest suite run.               "37 Tests, alle grün"
CborTypeRegistryTest suite run.   "17 Tests, alle grün"
CborVectorTest suite run.         " 6 Tests, alle grün: prüft alle 18 gemeinsamen Testvektoren"
```

## Hinweise

- **Verschachtelungstiefe:** Die Standardgrenze von 256 liegt bewusst unter dem Stack-Limit von GemStone (ca. 2000 Frames), weil jede Ebene mehrere Frames belegt.
- **Floats:** NaN wird immer als `f9 7e00` geschrieben. Ein NaN-Payload geht dabei verloren.
- **Mengen:** Beim Decodieren von Tag 258 entsteht ein `Set`. Ein `IdentitySet` wird zwar als Tag 258 geschrieben, kommt aber als `Set` zurück.
- **Datum:** `DateAndTime` wird als Unix-Sekunden (Tag 1) geschrieben. Der Zeitzonen-Offset geht dabei verloren, decodiert wird in UTC.

## Lizenz

MIT, siehe [LICENSE](LICENSE).
