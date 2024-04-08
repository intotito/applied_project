var assert = require('assert');
const {formatDate, enforceDigits, compareDates} = require('../src/utils/utils');
const {initializeDatabase} = require('../src/db/rel_db');

// after all tests
after(function () {
  console.log('after all tests');
});

// Date formatting tests
describe('Date Formatting', function () {
    describe('enforceDigits()', function () {
        it('should return 2 digits for single digit numbers', function () {
            assert.equal(enforceDigits(1, 2), '01');
        });
        it('should return 2 digits for double digit numbers', function () {
            assert.equal(enforceDigits(12, 2), '12');
        });
    });
    describe('formatDate()', function () {
        it('should return date in format YYYY-MM-DDTHH:MM:SS:MS', function () {
            assert.equal(formatDate(new Date('2020-01-01')), '2020-01-01T00:00:00.000');
        });
    });
    describe('compareDates()', function () {
        it('should return true for same dates', function () {
            assert.equal(compareDates(new Date('2020-01-01T11:24:38.322'), new Date('2020-01-01T03:45:00.000')), true);
        });
        it('should return false for different dates', function () {
            assert.equal(compareDates(new Date('2020-01-01'), new Date('2020-01-02')), false);
        });
    });
});

// Database Connection test
describe('Database Connection', function () {
    describe('connect()', function () {
        it('should connect to the database', function () {
            db_connection = initializeDatabase().then((db) => {
                assert.equal(db.state, 'authenticated');
                db_connection.end();
            }).catch((err) => {
                console.log('Error:', err);
            })
        });
    });
});
