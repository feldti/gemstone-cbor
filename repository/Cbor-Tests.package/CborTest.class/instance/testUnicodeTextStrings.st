tests - strings
testUnicodeTextStrings
	| uUmlaut water symbol |
	uUmlaut := (Character codePoint: 16rFC) asString.
	water := (Character codePoint: 16r6C34) asString.
	symbol := (Character codePoint: 16r10151) asString.
	self assertEncoding: uUmlaut is: '62c3bc'.
	self assertEncoding: water is: '63e6b0b4'.
	self assertEncoding: symbol is: '64f0908591'.
	self assert: (self utf8Of: (self decodeHex: '62c3bc')) equals: #[16rC3 16rBC].
	self assert: (self utf8Of: (self decodeHex: '63e6b0b4')) equals: #[16rE6 16rB0 16rB4].
	self assert: (self utf8Of: (self decodeHex: '64f0908591')) equals: #[16rF0 16r90 16r85 16r91].
	self assert: (self decodeHex: '62c3bc') size equals: 1.
	self assert: (self decodeHex: '64f0908591') size equals: 1