instance creation
new
	"Answer an encoder writing into a fresh ByteArray.
	 (A hand-written growable buffer was measured to be slower than GemStone's
	 WriteStream on a ByteArray, see CborBenchmark.)"

	^self on: (WriteStream on: ByteArray new)