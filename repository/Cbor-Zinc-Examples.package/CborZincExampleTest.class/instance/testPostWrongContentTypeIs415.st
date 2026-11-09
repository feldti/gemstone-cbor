tests
testPostWrongContentTypeIs415
	| client |
	client := ZnClient new.
	client
		url: (self url: '/customers');
		entity: (ZnEntity with: '{"name":"Ada"}' type: 'application/json');
		post.
	self assert: client response code equals: 415