tests - tags
testEpochDateTime
	| dt |
	dt := self decodeHex: 'c11a514b67b0'.
	self assert: (dt isKindOf: DateAndTimeANSI).
	self assert: dt asPosixSeconds equals: 1363896240.
	self assertEncoding: dt is: 'c11a514b67b0'.
	dt := self decodeHex: 'c1fb41d452d9ec200000'.
	self assert: dt asPosixSeconds equals: 1363896240.5