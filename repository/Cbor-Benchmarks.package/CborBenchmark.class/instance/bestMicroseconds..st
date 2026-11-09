measuring
bestMicroseconds: aBlock
	"Answer the fastest of runs executions of aBlock, in microseconds."

	| best |
	best := nil.
	runs timesRepeat: [| t |
		t := System microsecondsToRun: aBlock.
		(best isNil or: [t < best]) ifTrue: [best := t]].
	^best