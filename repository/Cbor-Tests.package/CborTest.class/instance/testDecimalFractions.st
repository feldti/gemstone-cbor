tests - tags
testDecimalFractions
	| value |
	value := self decodeHex: 'c48221196ab3'.
	self assert: value equals: 273.15s2.
	self assert: (value isKindOf: ScaledDecimal).
	self assertEncoding: 273.15s2 is: 'c48221196ab3'.
	self assert: (self decodeHex: 'c482021863') equals: 9900