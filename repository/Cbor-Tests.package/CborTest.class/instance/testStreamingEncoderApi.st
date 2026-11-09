tests - indefinite
testStreamingEncoderApi
	| e |
	e := CborEncoder new.
	e writeIndefiniteMapStart.
	e encode: 'Fun'; encode: true.
	e encode: 'Amt'; encode: -2.
	e writeBreak.
	self assert: (Cbor hexFromBytes: e contents) equals: 'bf6346756ef563416d7421ff'.
	e := CborEncoder new.
	e writeIndefiniteTextStart; encode: 'strea'; encode: 'ming'; writeBreak.
	self assert: (Cbor hexFromBytes: e contents) equals: '7f657374726561646d696e67ff'