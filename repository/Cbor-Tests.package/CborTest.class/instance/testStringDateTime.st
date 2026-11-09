tests - tags
testStringDateTime
	| dt |
	dt := self decodeHex: 'c074323031332d30332d32315432303a30343a30305a'.
	self assert: (dt isKindOf: DateAndTimeANSI).
	self assert: dt asPosixSeconds equals: 1363896240.
	dt := Cbor decode: (Cbor encode: (CborTag tag: 0 value: '2013-03-21T22:04:00+02:00')).
	self assert: dt asPosixSeconds equals: 1363896240.
	dt := Cbor decode: (Cbor encode: (CborTag tag: 0 value: '1969-12-31T23:59:59.5Z')).
	self assert: dt asPosixSeconds equals: -0.5.
	dt := Cbor decode: (Cbor encode: (CborTag tag: 0 value: 'not a date')).
	self assert: dt equals: (CborTag tag: 0 value: 'not a date')