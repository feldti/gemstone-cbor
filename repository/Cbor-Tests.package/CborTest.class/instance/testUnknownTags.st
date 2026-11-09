tests - tags
testUnknownTags
	| decoded |
	decoded := self decodeHex: 'd74401020304'.
	self assert: decoded equals: (CborTag tag: 23 value: #[1 2 3 4]).
	self assertEncoding: decoded is: 'd74401020304'.
	decoded := self decodeHex: 'd818456449455446'.
	self assert: decoded tag equals: 24.
	self assert: decoded value equals: (self hex: '6449455446').
	decoded := self decodeHex: 'd82076687474703a2f2f7777772e6578616d706c652e636f6d'.
	self assert: decoded equals: (CborTag tag: 32 value: 'http://www.example.com')