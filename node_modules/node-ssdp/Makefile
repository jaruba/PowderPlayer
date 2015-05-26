REPORTER = spec

test:
	@mocha --recursive --reporter $(REPORTER)

coverage:
	@$(MAKE) clean
	@mkdir reports
	@node_modules/.bin/istanbul instrument --output lib-cov lib
	@ISTANBUL_REPORTERS=lcov SSDP_COV=1 node_modules/.bin/mocha --recursive -R mocha-istanbul -t 20s $(TESTS)
	@mv lcov.info reports
	@mv lcov-report reports
	@rm -rf lib-cov coverage

coveralls: test coverage
	@cat reports/lcov.info | ./node_modules/.bin/coveralls
	@$(MAKE) clean

clean:
	@rm -rf lib-cov lcov-report reports lcov.info

.PHONY: test test-cov coverage
