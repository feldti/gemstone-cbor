tests - indefinite
testIndefiniteLength
	| decoded |
	self assert: (self decodeHex: '5f42010243030405ff') equals: #[1 2 3 4 5].
	self assert: (self decodeHex: '7f657374726561646d696e67ff') equals: 'streaming'.
	self assert: (self decodeHex: '9fff') equals: #().
	self assert: (self decodeHex: '9f018202039f0405ffff') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '9f01820203820405ff') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '83018202039f0405ff') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '83019f0203ff820405') equals: {1. #(2 3). #(4 5)}.
	self assert: (self decodeHex: '9f0102030405060708090a0b0c0d0e0f101112131415161718181819ff') equals: (1 to: 25) asArray.
	decoded := self decodeHex: 'bf61610161629f0203ffff'.
	self assert: (decoded at: 'a') equals: 1.
	self assert: (decoded at: 'b') equals: #(2 3).
	decoded := self decodeHex: '826161bf61626163ff'.
	self assert: (decoded last at: 'b') equals: 'c'.
	decoded := self decodeHex: 'bf6346756ef563416d7421ff'.
	self assert: (decoded at: 'Fun') equals: true.
	self assert: (decoded at: 'Amt') equals: -2