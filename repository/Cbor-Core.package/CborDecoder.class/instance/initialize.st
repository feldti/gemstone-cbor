initialization
initialize
	"maxDepth is kept well below the GemStone execution stack limit;
	 each nesting level costs a few stack frames."

	tagDecoders := Dictionary new.
	mapClass := Dictionary.
	unicodeStrings := false.
	rejectDuplicateKeys := false.
	depth := 0.
	maxDepth := 256