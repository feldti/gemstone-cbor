initialization
initialize
	"maxDepth is kept well below the GemStone execution stack limit;
	 each nesting level costs a few stack frames."

	canonical := false.
	shortestFloats := true.
	depth := 0.
	maxDepth := 256