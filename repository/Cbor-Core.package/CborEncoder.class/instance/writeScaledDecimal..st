writing - objects
writeScaledDecimal: aScaledDecimal
	"Tag 4 decimal fraction: [exponent, mantissa] with value = mantissa * 10^exponent."

	self writeTag: 4.
	self writeArrayHeader: 2.
	self writeInteger: aScaledDecimal scale negated.
	self writeInteger: aScaledDecimal mantissa