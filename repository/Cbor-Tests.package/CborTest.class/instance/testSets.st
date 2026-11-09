tests - collections
testSets
	| decoded |
	self assertEncoding: (Set withAll: #(3 1 2)) is: 'd9010283010203'.
	decoded := self decodeHex: 'd9010283010203'.
	self assert: (decoded isKindOf: Set).
	self assert: decoded size equals: 3.
	self assert: (decoded includes: 2)