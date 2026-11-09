initialization
initialize
	registry := CborTypeRegistry new.
	registry register: CborTestCustomer tag: 40002.
	registry register: CborTestAddress tag: 40003