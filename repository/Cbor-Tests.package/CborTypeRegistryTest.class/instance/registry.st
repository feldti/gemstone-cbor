helpers
registry
	"A fresh registry with CborTestPoint as tag 40001 (selector based)."

	| r |
	r := CborTypeRegistry new.
	r register: CborTestPoint tag: 40001.
	^r