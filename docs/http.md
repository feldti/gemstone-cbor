# CBOR über HTTP

Dieses Dokument beschreibt, wie Clients und Server CBOR-Daten per HTTP austauschen: welche Medientypen, welche Header, welche Statuscodes. Es gilt für alle Sprachen. Die GemStone-Beispiele mit Zinc am Ende sind als SUnit-Tests im Paket `Cbor-Zinc-Examples` hinterlegt und laufen gegen einen echten Zinc-Server auf `localhost`.

## 1. Medientypen

| Medientyp | Wann | Quelle |
|---|---|---|
| `application/cbor` | **ein** CBOR-Datenelement im Body, der Normalfall | RFC 8949, Abschnitt 9.5 |
| `application/cbor-seq` | **mehrere** Datenelemente hintereinander (CBOR-Sequenz), z.B. zum Streamen | RFC 8742 |
| `application/<name>+cbor` | eigenes Format auf CBOR-Basis, z.B. `application/vnd.example.customer+cbor` | Strukturiertes Suffix `+cbor` |
| `application/concise-problem-details+cbor` | Fehlerbeschreibung im Fehlerfall | RFC 9290 |

Regeln:
- **Kein `charset`-Parameter.** CBOR ist binär, und für `application/cbor` sind keine Parameter definiert. `application/cbor; charset=utf-8` ist falsch. Texte im CBOR sind ohnehin immer UTF-8.
- **Nicht `application/octet-stream` verwenden.** Dann weiß der Empfänger nicht, dass es CBOR ist.
- **Den Body nicht base64-codieren.** Er wird als rohe Bytes übertragen.
- **Eigener Typ mit `+cbor`:** Ein Typ wie `application/vnd.example.customer+cbor` sagt zusätzlich, *welches* Schema gilt. Generische Werkzeuge erkennen am Suffix trotzdem, dass es CBOR ist. Sinnvoll, wenn eine API mehrere Formate oder Versionen unterscheiden muss, z.B. `application/vnd.example.customer.v2+cbor`. Für eine API mit einem einzigen Vertrag reicht `application/cbor`.
- **CoAP statt HTTP:** Dort heißt dasselbe Content-Format 60 (`application/cbor`) bzw. 63 (`application/cbor-seq`).

## 2. Daten abrufen (GET)

Der Client sagt mit `Accept`, dass er CBOR haben möchte:

```http
GET /customers/42 HTTP/1.1
Host: api.example.com
Accept: application/cbor
```

Antwort:

```http
HTTP/1.1 200 OK
Content-Type: application/cbor
Content-Length: 12

<12 Bytes: d9 9c 42 a2 01 63 41 64 61 02 18 2a>
```

Die 12 Bytes sind der Kunde aus `spec/types.cddl`, in Diagnose-Notation `40002({1: "Ada", 2: 42})`, also Tag 40002, `name` = "Ada", `id` = 42.

**Mit JSON als Ausweichformat:** Kann der Client beides, gibt er Prioritäten an:

```http
Accept: application/cbor, application/json;q=0.5
```

Der Server liefert dann CBOR, wenn er kann, sonst JSON. Er nennt das Gewählte in `Content-Type` und sollte zusätzlich `Vary: Accept` setzen, damit Caches die beiden Varianten nicht verwechseln.

## 3. Daten senden (POST/PUT)

Der Client sagt mit `Content-Type`, was er schickt, und mit `Accept`, was er zurückhaben möchte:

```http
POST /customers HTTP/1.1
Host: api.example.com
Content-Type: application/cbor
Accept: application/cbor
Content-Length: 13

<13 Bytes: d9 9c 42 a2 01 65 47 72 61 63 65 02 07>
```

Das ist `40002({1: "Grace", 2: 7})`.

Antwort bei Erfolg:

```http
HTTP/1.1 201 Created
Content-Type: application/cbor
Location: /customers/7

<CBOR des angelegten Kunden>
```

## 4. Statuscodes und Fehler

| Situation | Status | Body |
|---|---|---|
| Client akzeptiert kein CBOR (`Accept: application/json` o.ä.) | **406 Not Acceptable** | leer oder Problem Details |
| Request-Body ist kein CBOR (`Content-Type` falsch oder fehlt) | **415 Unsupported Media Type** | leer oder Problem Details |
| Body ist kein gültiges CBOR (abgeschnitten, kaputt) | **400 Bad Request** | Problem Details |
| Body ist gültiges CBOR, verletzt aber den Vertrag (Pflichtfeld fehlt, falscher Typ) | **400 Bad Request**, alternativ **422 Unprocessable Content** | Problem Details |

Fehlerbeschreibungen werden am besten selbst als CBOR geschickt, als **Concise Problem Details** (RFC 9290). Das ist eine Map mit negativen Integer-Schlüsseln für die Standardfelder:

| Schlüssel | Bedeutung |
|---|---|
| -1 | title, kurze Überschrift |
| -2 | detail, Beschreibung dieses konkreten Fehlers |
| -3 | instance, URI des betroffenen Vorgangs |

```http
HTTP/1.1 400 Bad Request
Content-Type: application/concise-problem-details+cbor

{-1: "Bad Request", -2: "customer id must be an unsigned integer"}
```

Eigene zusätzliche Felder bekommen nicht-negative Schlüssel oder Text-Schlüssel.

## 5. Weitere Header

| Header | Empfehlung |
|---|---|
| `Content-Length` | angeben. Bei Streams alternativ `Transfer-Encoding: chunked` (HTTP/1.1). |
| `Content-Encoding: gzip` | möglich, aber CBOR ist schon kompakt. Lohnt sich vor allem bei vielen gleichen Strings. Der Client fordert es mit `Accept-Encoding: gzip` an. |
| `ETag` | Für stabile ETags den Body **deterministisch** codieren (`encodeCanonical:`). Dann ergibt gleicher Inhalt gleiche Bytes und damit denselben Hash. |
| `Vary: Accept` | setzen, wenn derselbe URL je nach `Accept` CBOR oder JSON liefert |

**Self-Describe-Tag:** Optional kann der Body mit Tag 55799 beginnen (Bytes `d9 d9 f7`). Er ändert die Daten nicht, macht eine Datei aber am Anfang als CBOR erkennbar. Für HTTP ist er unnötig, weil `Content-Type` diese Aufgabe übernimmt. Diese Bibliothek überliest ihn beim Decodieren.

## 6. Streaming mit `application/cbor-seq`

Für große oder laufend erzeugte Ergebnisse schickt der Server einfach mehrere CBOR-Elemente hintereinander, ohne umschließendes Array:

```http
HTTP/1.1 200 OK
Content-Type: application/cbor-seq
Transfer-Encoding: chunked

<Element 1><Element 2><Element 3>...
```

Der Client kann jedes Element verarbeiten, sobald es vollständig angekommen ist. In GemStone: `Cbor decodeSequence: bytes` oder `(CborDecoder on: aStream) decode` in einer Schleife bis `atEnd`.

## 7. Ausprobieren mit curl

```bash
# abrufen und speichern
curl -H 'Accept: application/cbor' -o customer.cbor https://api.example.com/customers/42

# senden - wichtig: --data-binary, nicht -d (-d verändert Zeilenumbrüche im Body)
curl -X POST \
     -H 'Content-Type: application/cbor' \
     -H 'Accept: application/cbor' \
     --data-binary @customer.cbor \
     -o answer.cbor \
     https://api.example.com/customers
```

Lesbar machen lässt sich CBOR mit den Werkzeugen aus dem Ruby-Gem `cbor-diag`. Es wird mit dem `cddl`-Gem automatisch installiert:

```bash
cbor2diag.rb customer.cbor                       # => 40002({1: "Ada", 2: 42})
echo '40002({1: "Ada", 2: 42})' | diag2cbor.rb > customer.cbor
xxd customer.cbor                                # Rohbytes
```

## 8. GemStone mit Zinc

Die folgenden Ausschnitte stammen aus `CborHttpExample` (Server) und `CborZincExampleTest` (Client), beide im Paket `Cbor-Zinc-Examples`. Laden mit Metacello: `load: 'Zinc'`, als Topaz-Fileout: `src/CborZincExamples.gs`. Voraussetzung ist ein Image mit Zinc.

Wichtig zu wissen: Zinc behandelt `application/cbor` als Binärtyp. Der Body kommt als `ByteArray` in einer `ZnByteArrayEntity` an (`entity bytes`) und wird nie als Text decodiert.

### Client

```smalltalk
| registry client customer |
registry := CborTypeRegistry new.
registry register: Customer tag: 40002.

"GET: CBOR anfordern und gleich in Objekte umwandeln"
client := ZnClient new.
client
	url: 'https://api.example.com/customers/42';
	accept: 'application/cbor';
	contentReader: [:entity | registry decode: entity bytes].
customer := client get.                     "=> ein Customer"
client response code.                       "=> 200"

"POST: Objekt als CBOR senden"
client := ZnClient new.
client
	url: 'https://api.example.com/customers';
	accept: 'application/cbor';
	entity: (ZnEntity with: (registry encode: customer) type: 'application/cbor');
	contentReader: [:entity | registry decode: entity bytes].
client post.
```

Ohne `contentReader:` liefert `client get` das rohe `ByteArray`.

### Server

```smalltalk
server := ZnServer startOn: 8080.
server onRequestRespond: [:request | self handleRequest: request].
```

```smalltalk
handleRequest: request
	(self acceptsCbor: request) ifFalse: [^self respond: 406 with: nil type: nil].
	request method asString = 'GET'
		ifTrue: [^self respond: 200 with: (self customerFor: request uri) type: 'application/cbor'].
	request method asString = 'POST'
		ifFalse: [^self respond: 405 with: nil type: nil].
	(self hasCborBody: request) ifFalse: [^self respond: 415 with: nil type: nil].
	^[self respond: 201 with: (registry decode: request entity bytes) type: 'application/cbor']
		on: CborError
		do: [:ex | ex return: (self respond: 400
			with: (Dictionary new at: -1 put: 'Bad Request'; at: -2 put: ex messageText; yourself)
			type: 'application/concise-problem-details+cbor')]

acceptsCbor: request
	| accept |
	accept := request headers at: 'Accept' ifAbsent: ['*/*'].
	^(accept includesSubstring: 'application/cbor')
		or: [(accept includesSubstring: '*/*') or: [accept includesSubstring: 'application/*']]

hasCborBody: request
	^request contentType notNil
		and: [request contentType matches: 'application/cbor' asZnMimeType]

respond: statusCode with: anObjectOrNil type: aMediaTypeString
	| response |
	response := ZnResponse new.
	response statusLine: (ZnStatusLine code: statusCode).
	anObjectOrNil isNil
		ifFalse: [response entity: (ZnEntity with: (registry encode: anObjectOrNil) type: aMediaTypeString)].
	^response
```

`acceptsCbor:` ist bewusst einfach gehalten. Es wertet keine `q`-Gewichte aus und lehnt `application/cbor;q=0` nicht ab. Für eine echte API, die zwischen CBOR und JSON wählt, sollte der `Accept`-Header richtig ausgewertet werden.

### Was die Tests abdecken

`CborZincExampleTest` startet für jeden Test einen Zinc-Server auf `localhost:18765` und prüft:

| Test | Erwartung |
|---|---|
| `testGetDecodedWithContentReader` | 200, `Content-Type: application/cbor`, Body wird zum `CborTestCustomer` |
| `testGetRawBytes` | Body ist ein `ByteArray` mit genau `d99c42a2016341646102182a` |
| `testPostCbor` | 201, der gesendete Kunde kommt decodiert zurück |
| `testPostWrongContentTypeIs415` | JSON-Body → 415 |
| `testNotAcceptableIs406` | `Accept: application/json` → 406 |
| `testInvalidBodyIs400WithProblemDetails` | negativer `id` → 400, `application/concise-problem-details+cbor`, Felder -1/-2 |
| `testMalformedCborIs400` | abgeschnittenes CBOR → 400 |
