data
nextRandom: limit
	"Deterministic pseudo random numbers (LCG), so every run uses the same data."

	seed := (seed * 1103515245 + 12345) \\ 2147483648.
	^seed \\ limit