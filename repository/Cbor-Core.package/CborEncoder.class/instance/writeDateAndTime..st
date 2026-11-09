writing - objects
writeDateAndTime: aDateAndTime
	"Tag 1 epoch-based date/time (seconds since 1970-01-01T00:00Z)."

	| seconds |
	seconds := aDateAndTime asPosixSeconds.
	self writeTag: 1.
	seconds truncated = seconds
		ifTrue: [self writeInteger: seconds truncated]
		ifFalse: [self writeFloat: seconds asFloat]