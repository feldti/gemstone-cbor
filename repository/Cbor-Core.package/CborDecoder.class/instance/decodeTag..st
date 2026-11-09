private - decoding
decodeTag: tagNumber
	| value handler |
	self enter.
	value := self decodeNested.
	self leave.
	handler := tagDecoders at: tagNumber ifAbsent: [nil].
	handler notNil ifTrue: [^handler value: value].
	^self decodeStandardTag: tagNumber value: value