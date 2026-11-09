tests
testNotAcceptableIs406
	| client |
	client := ZnClient new.
	client
		url: (self url: '/customers/42');
		accept: 'application/json';
		get.
	self assert: client response code equals: 406