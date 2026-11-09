# CBOR mit Sencha Ext JS

Dieses Dokument zeigt, wie eine Ext-JS-Anwendung CBOR statt JSON mit einem Server austauscht, z.B. mit dem GemStone/Zinc-Server aus [`http.md`](http.md).

> **Status: ungetesteter Entwurf.** Die Klassen sind für Ext JS 6/7 geschrieben, aber noch nicht in einer echten Ext-JS-Anwendung ausgeführt worden. Stellen, die von Ext-Interna abhängen, sind mit **(prüfen)** markiert. Bitte vor dem Einsatz gegen die verwendete Ext-JS-Version testen.

## Überblick

Im Browser verhält sich CBOR wie JSON. Gebraucht werden drei Teile:

1. **eine CBOR-Bibliothek im Browser.** Ext JS bringt keine mit. Gängig sind [`cbor-x`](https://github.com/kriszyp/cbor-x) (schnell, mit API für eigene Tags) und [`cbor2`](https://github.com/hildjj/cbor2).
2. **ein Proxy, der binär arbeitet:** Antworten als Bytes empfangen, Request-Bodies als Bytes senden.
3. **ein Reader, der CBOR decodiert.** Danach arbeitet das Ext-Datenpaket (Models, Stores, Grids, Formulare) unverändert mit den Objekten.

```
 Ext Store/Model ──► Writer (JSON-Objekt) ──► Proxy: CBOR.encode ──► POST application/cbor ──► Server
 Ext Store/Model ◄── Reader: CBOR.decode ◄── Proxy: binary=true  ◄── 200 application/cbor  ◄── Server
```

Die Beispiele verwenden ein globales Objekt `CBOR` mit den Funktionen `encode`, `decode` und `addExtension`, wie sie `cbor-x` anbietet. Bei einer anderen Bibliothek die Aufrufe entsprechend anpassen.

## 1. Bibliothek einbinden

- **Ext JS 7 mit npm (Open Tooling):** `npm install cbor-x`, dann beim Start z.B. `import * as CBOR from 'cbor-x'; window.CBOR = CBOR;`.
- **Sencha Cmd (klassisch):** das Browser-Bundle der Bibliothek ins Projekt legen und in `app.json` unter `"js"` eintragen, damit es vor dem App-Code geladen wird:

  ```json
  "js": [
      { "path": "lib/cbor-x.js", "bundle": false, "includeInBundle": true },
      { "path": "app.js", "bundle": true }
  ]
  ```

## 2. Reader: CBOR-Antworten lesen

Der Reader leitet vom JSON-Reader ab und ersetzt nur das Parsen. `rootProperty`, `totalProperty`, `successProperty`, `messageProperty` und `transform` funktionieren danach wie gewohnt.

```js
Ext.define('App.data.reader.Cbor', {
    extend: 'Ext.data.reader.Json',
    alias: 'reader.cbor',

    getResponseData: function (response) {
        var bytes = response.responseBytes;              // nur vorhanden, wenn der Proxy binary: true hat
        if (bytes instanceof ArrayBuffer) {
            bytes = new Uint8Array(bytes);
        }
        try {
            return CBOR.decode(bytes);                   // liefert einen Objekt-Baum wie JSON.parse
        } catch (ex) {
            Ext.log.warn('Ungültiges CBOR vom Server: ' + ex.message);
            return this.createReadError(ex.message);
        }
    }
});
```

**(prüfen)** Ob `response.responseBytes` ein `ArrayBuffer` oder ein `Uint8Array` ist, hängt von der Ext-Version ab. Der Code behandelt beides.

## 3. Proxy: binär anfragen und senden

```js
Ext.define('App.data.proxy.Cbor', {
    extend: 'Ext.data.proxy.Ajax',
    alias: 'proxy.cbor',

    binary: true,                                        // Antwort als Bytes anfordern
    headers: { Accept: 'application/cbor' },
    reader: { type: 'cbor' },
    writer: { type: 'json', writeAllFields: true },      // erzeugt das Objekt, codiert wird unten

    // Ersetzt den JSON-Body des Requests durch CBOR.
    sendRequest: function (request) {
        var config = request.getCurrentConfig(),         // (prüfen)
            body = config.jsonData;

        if (body !== undefined && body !== null) {
            delete config.jsonData;
            config.binaryData = Array.from(CBOR.encode(body));   // (prüfen) Ext erwartet ein Byte-Array
            config.headers = Ext.apply({ 'Content-Type': 'application/cbor' }, config.headers);
        }
        request.setRawRequest(Ext.Ajax.request(config)); // (prüfen)
        this.lastRequest = request;
        return request;
    }
});
```

Der normale JSON-Writer baut das zu sendende Objekt. Der Proxy codiert es erst unmittelbar vor dem Senden als CBOR. So bleiben alle Writer-Optionen nutzbar (`writeAllFields`, `rootProperty`, `allowSingle` usw.).

**(prüfen)** `sendRequest` bildet die Implementierung von `Ext.data.proxy.Ajax` nach. Falls sich die Methode in der verwendeten Version anders verhält, alternativ `doRequest` überschreiben. Nachsehen lässt sich das im Quelltext unter `ext/packages/core/src/data/proxy/Ajax.js`.

## 4. Model und Store

```js
Ext.define('App.model.Customer', {
    extend: 'Ext.data.Model',
    fields: [
        { name: 'id',        type: 'int' },
        { name: 'name',      type: 'string' },
        { name: 'addresses', type: 'auto' },
        { name: 'createdAt', type: 'date' }              // CBOR-Tag 1 kommt als Date an
    ],
    proxy: {
        type: 'cbor',
        url: '/customers',
        reader: { rootProperty: 'data', totalProperty: 'total' }
    }
});

var store = Ext.create('Ext.data.Store', { model: 'App.model.Customer', autoLoad: true });
```

Grid, Formulare und ViewModels merken nichts davon, dass die Daten als CBOR übertragen werden.

## 5. Integer-Keys und Tags auf Ext-Felder abbilden

Das Format in [`spec/types.cddl`](../spec/types.cddl) verwendet Integer-Keys (`{1: name, 2: id, ...}`) und Tags. Ext-Models arbeiten mit Feld*namen*. Am saubersten übersetzt man das an **einer** Stelle, nämlich beim Decodieren, mit der Tag-API der Bibliothek. Das ist das Gegenstück zur `CborTypeRegistry` in GemStone.

```js
// Je nach Bibliothek und Option kommt eine CBOR-Map als Map oder als Objekt an.
var get = function (m, k) { return m instanceof Map ? m.get(k) : m[k]; };

// Tag-Nummern aus spec/types.cddl (siehe Hinweis unten)
CBOR.addExtension({
    tag: 40002,                                          // customer
    decode: function (m) {
        return {
            name: get(m, 1),
            id: get(m, 2),
            addresses: get(m, 3) || [],
            createdAt: get(m, 4)
        };
    }
});

CBOR.addExtension({
    tag: 40003,                                          // address
    decode: function (m) {
        return { street: get(m, 1), city: get(m, 2), zip: get(m, 3) };
    }
});
```

Danach ist ein Kunde für Ext ein gewöhnliches Objekt mit Feldnamen. Alternativ kann der Reader die Umwandlung mit `transform: function (data) { ... }` erledigen.

Für die **Gegenrichtung** (Speichern) müssen die Feldnamen wieder zu Integer-Keys und Tags werden. Das geschieht entweder im Proxy vor `CBOR.encode`, oder man registriert für die Encode-Seite eigene JavaScript-Klassen bei der Bibliothek. In `cbor-x` geht das per `addExtension` mit `Class` und `encode`.

> **Hinweis zu den Tag-Nummern:** 40001 bis 40003 sind die Beispielnummern aus `spec/types.cddl`. Bei der IANA sind sie bereits an Blockchain Commons vergeben (`ur:digest`, `ur:encrypted`, `ur:compressed`). Für echte Daten freie Nummern wählen und registrieren. Freie Blöcke unter 65 536 sind z.B. 33 001–39 999 oder 46 012–49 999.

## 6. Fehler behandeln

Der Server aus [`http.md`](http.md) antwortet bei Fehlern mit:

| Status | Bedeutung | Body |
|---|---|---|
| 406 | Client akzeptiert kein CBOR (falscher `Accept`-Header) | leer |
| 415 | Request-Body ist kein CBOR (falscher `Content-Type`) | leer |
| 400 | CBOR kaputt oder Vertrag verletzt | `application/concise-problem-details+cbor`: `{-1: Titel, -2: Detail}` |

Im Proxy-Event `exception` lässt sich die Fehlerbeschreibung so lesen:

```js
proxy.on('exception', function (proxy, response) {
    var bytes = response.responseBytes, problem;
    if (bytes && /concise-problem-details\+cbor/.test(response.getResponseHeader('Content-Type'))) {
        problem = CBOR.decode(bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes);
        Ext.Msg.alert(get(problem, -1), get(problem, -2));
    }
});
```

## 7. Was man gewinnt, und was nicht

- **Weniger Daten:** vor allem mit Integer-Keys und bei Zahlen, Zeitstempeln und Binärdaten. Ist der Transport ohnehin mit gzip komprimiert, bleibt nur ein kleiner Vorteil (siehe Messungen in [`performance.md`](performance.md) und in der README).
- **Typen bleiben erhalten:** `Date`, Bytes (`Uint8Array` statt base64) und große Ganzzahlen (`BigInt`) kommen ohne Konvertierungscode an.
- **Parsen im Browser:** Hier ist CBOR *nicht automatisch* schneller. `JSON.parse` ist nativer, hochoptimierter Code, eine CBOR-Bibliothek ist JavaScript. `cbor-x` kommt nah heran. Ob sich das lohnt, muss man mit echten Daten messen. Auf der **GemStone-Seite** ist CBOR dagegen deutlich schneller als NeoJSON (siehe `performance.md`).
- **Debugging:** Die Browser-Entwicklertools zeigen CBOR-Bodies nur als Bytes an. Zum Mitlesen hilft `cbor2diag.rb` (siehe `http.md`) oder ein `console.log(CBOR.decode(...))` im Reader.
