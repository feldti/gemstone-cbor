decoding
decode: aByteArray
	"Decode exactly one data item, converting registered tags into objects."

	| decoder result |
	decoder := self newDecoderOnBytes: aByteArray.
	result := decoder decode.
	decoder atEnd ifFalse: [^CborError signal: 'CBOR decode error: trailing bytes after data item'].
	^result