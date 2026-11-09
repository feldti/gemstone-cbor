decoding
decode: aByteArray
	"Decode exactly one CBOR data item from aByteArray. Signals CborError on
	 malformed input or trailing bytes."

	| decoder result |
	decoder := CborDecoder onBytes: aByteArray.
	result := decoder decode.
	decoder atEnd ifFalse: [^CborError signal: 'CBOR decode error: trailing bytes after data item'].
	^result