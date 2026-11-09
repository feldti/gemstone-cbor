helpers
classForRule: ruleName
	ruleName = 'point' ifTrue: [^CborTestPoint].
	ruleName = 'customer' ifTrue: [^CborTestCustomer].
	ruleName = 'address' ifTrue: [^CborTestAddress].
	ruleName = 'messages' ifTrue: [^Array].
	^self error: 'unknown CDDL rule ', ruleName