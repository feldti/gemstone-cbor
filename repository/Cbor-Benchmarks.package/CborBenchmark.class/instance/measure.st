measuring
measure
	"Answer an Array of result rows:
	 {name. cborSize. cborEncodeUs. cborDecodeUs. jsonSize. jsonEncodeUs. jsonDecodeUs}
	 JSON entries are nil when NeoJSON is not loaded or the data is binary."

	^datasets asArray collect: [:assoc | | data cbor json row |
		data := assoc value.
		cbor := Cbor encode: data.
		row := Array new: 7.
		row at: 1 put: assoc key.
		row at: 2 put: cbor size.
		row at: 3 put: (self bestMicroseconds: [Cbor encode: data]).
		row at: 4 put: (self bestMicroseconds: [Cbor decode: cbor]).
		(self jsonWriter notNil and: [(data isKindOf: ByteArray) not]) ifTrue: [
			json := self jsonWriter toString: data.
			row at: 5 put: json size.
			row at: 6 put: (self bestMicroseconds: [self jsonWriter toString: data]).
			row at: 7 put: (self bestMicroseconds: [self jsonReader fromString: json])].
		row]