tests - collections
testMaps
	| d decoded |
	self assertRoundTrip: Dictionary new hex: 'a0'.
	d := Dictionary new.
	d at: 1 put: 2; at: 3 put: 4.
	self assertRoundTrip: d hex: 'a201020304'.
	d := Dictionary new.
	d at: 'a' put: 1; at: 'b' put: #(2 3).
	self assertEncoding: d is: 'a26161016162820203'.
	decoded := self decodeHex: 'a26161016162820203'.
	self assert: decoded size equals: 2.
	self assert: (decoded at: 'a') equals: 1.
	self assert: (decoded at: 'b') equals: #(2 3).
	decoded := self decodeHex: '826161a161626163'.
	self assert: decoded first equals: 'a'.
	self assert: (decoded last at: 'b') equals: 'c'