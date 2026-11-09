private - decoding
dateTimeFromString: value
	"Tag 0: RFC 3339 date/time string -> DateAndTime with the offset given in the string.
	 Answers the CborTag itself if the string is not valid RFC 3339."

	| parsed |
	(value isKindOf: CharacterCollection) ifFalse: [^self signalError: 'tag 0 requires a text string'].
	parsed := self parseRfc3339: value.
	parsed isNil ifTrue: [^CborTag tag: 0 value: value].
	^DateAndTime posixSeconds: parsed first offset: (Duration seconds: parsed last)