writing - low level
writeSimple: anInteger
	"Write simple value anInteger (0..255, excluding the reserved range 24..31)."

	(anInteger between: 0 and: 23) ifTrue: [^self writeHead: 7 value: anInteger].
	(anInteger between: 32 and: 255) ifTrue: [stream nextPut: 16rF8; nextPut: anInteger. ^self].
	^CborError signal: 'invalid CBOR simple value: ', anInteger printString