private - decoding
decimalFractionFrom: value
	"Tag 4: [exponent, mantissa] -> ScaledDecimal (exponent <= 0) or Integer."

	| exponent mantissa |
	((value isKindOf: Array) and: [value size = 2
		and: [(value first isKindOf: Integer) and: [value last isKindOf: Integer]]])
		ifFalse: [^self signalError: 'tag 4 requires [integer, integer]'].
	exponent := value first.
	mantissa := value last.
	exponent >= 0 ifTrue: [^mantissa * (10 raisedTo: exponent)].
	^ScaledDecimal mantissa: mantissa scale: exponent negated