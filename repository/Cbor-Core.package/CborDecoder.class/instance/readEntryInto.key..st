private - decoding
readEntryInto: aMap key: key
	| value |
	value := self decodeNested.
	(rejectDuplicateKeys and: [aMap includesKey: key])
		ifTrue: [^self signalError: 'duplicate map key ', key printString].
	aMap at: key put: value