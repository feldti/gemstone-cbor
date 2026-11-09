writing - low level
writeHead: majorType value: anInteger
	"Write the initial byte(s) of a data item with the shortest argument encoding."

	| base |
	base := majorType bitShift: 5.
	anInteger < 0 ifTrue: [^CborError signal: 'CBOR head argument must not be negative'].
	anInteger < 24 ifTrue: [^stream nextPut: base + anInteger].
	anInteger < 256 ifTrue: [stream nextPut: base + 24; nextPut: anInteger. ^self].
	anInteger < 65536 ifTrue: [stream nextPut: base + 25. ^self writeUnsigned: anInteger bytes: 2].
	anInteger < 4294967296 ifTrue: [stream nextPut: base + 26. ^self writeUnsigned: anInteger bytes: 4].
	anInteger < 18446744073709551616 ifTrue: [stream nextPut: base + 27. ^self writeUnsigned: anInteger bytes: 8].
	^CborError signal: 'CBOR head argument exceeds 64 bits'