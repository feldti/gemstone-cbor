helpers
registry
	"Tag assignments from spec/types.cddl."

	| r |
	r := CborTypeRegistry new.
	r register: CborTestPoint tag: 40001.
	r register: CborTestCustomer tag: 40002.
	r register: CborTestAddress tag: 40003.
	^r