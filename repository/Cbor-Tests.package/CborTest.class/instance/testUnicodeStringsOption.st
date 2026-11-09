tests - strings
testUnicodeStringsOption
	| decoder result |
	decoder := CborDecoder onBytes: (self hex: '6449455446').
	decoder unicodeStrings: true.
	result := decoder decode.
	self assert: (result isKindOf: Unicode7).
	self assert: (self utf8Of: result) equals: (self utf8Of: 'IETF')