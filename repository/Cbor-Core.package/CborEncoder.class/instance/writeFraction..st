writing - objects
writeFraction: aFraction
	"Tag 30 rational number: [numerator, denominator]."

	self writeTag: 30.
	self writeArrayHeader: 2.
	self writeInteger: aFraction numerator.
	self writeInteger: aFraction denominator