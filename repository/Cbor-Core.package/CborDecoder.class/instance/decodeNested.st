private - decoding
decodeNested
	"Decode an item that is part of an enclosing structure (break not allowed)."

	| item |
	item := self decodeItemOrBreak.
	item == self ifTrue: [^self signalError: 'unexpected break code'].
	^item