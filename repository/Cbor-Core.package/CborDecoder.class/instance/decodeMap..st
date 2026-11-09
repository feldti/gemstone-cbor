private - decoding
decodeMap: size
	| map |
	self enter.
	map := mapClass new.
	size timesRepeat: [self readEntryInto: map key: self decodeNested].
	self leave.
	^map