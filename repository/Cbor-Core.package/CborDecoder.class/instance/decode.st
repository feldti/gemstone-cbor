decoding
decode
	"Read and answer the next complete CBOR data item."

	| item |
	item := self decodeItemOrBreak.
	item == self ifTrue: [^self signalError: 'unexpected break code'].
	^item