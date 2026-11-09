data
floats: count
	"Mostly doubles that need 64 bits, some exactly representable in 16 or 32 bits."

	^(1 to: count) collect: [:i |
		i \\ 4 = 0
			ifTrue: [(self nextRandom: 1000) asFloat / 8]
			ifFalse: [(self nextRandom: 1000000) asFloat / 997]]