REPORTER = spec

test:
	@NODE_ENV=test ./node_modules/.bin/mocha -b --reporter $(REPORTER)

coverage:
	$(MAKE) test REPORTER=html-cov  > coverage.html

coveralls:
	echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	$(MAKE) test REPORTER=mocha-lcov-reporter | ./node_modules/coveralls/bin/coveralls.js

.PHONY: test