const { parsePhoneNumberFromString } = require('libphonenumber-js');





class PhoneNumberParser {
    constructor() {
        this.countryValidations = {
            US: /^\+1\d{10}$/, // USA: +1 followed by 10 digits
            UK: /^\+44\d{10}$/, // UK: +44 followed by 10 digits
            UA: /^\+380\d{9}$/, // Ukraine: +380 followed by 9 digits
            FR: /^\+33\d{9}$/, // France: +33 followed by 9 digits
            DE: /^\+49\d{10,11}$/ // Germany: +49 followed by 10-11 digits
        };

        this.defaultCountry = 'US'; // Default country for parsing
    }

    /**
     * Parses and validates a phone number, ensuring it has a country code.
     * @param {string} phoneNumber - The input phone number.
     * @param {string} countryCode - The default country (ISO 2-letter format, e.g., 'US').
     * @returns {string|null} - The formatted phone number with the country code, or null if invalid.
     */
    parse(phoneNumber, countryCode = this.defaultCountry) {
        let parsedNumber = parsePhoneNumberFromString(phoneNumber, countryCode);
        
        if (!parsedNumber || !parsedNumber.isValid()) {
            return null; // Invalid phone number
        }

        let formattedNumber = parsedNumber.format('E.164'); // +[country_code][number]

        // Validate against country-specific rules if defined
        const detectedCountry = parsedNumber.country;
        if (this.countryValidations[detectedCountry] && !this.countryValidations[detectedCountry].test(formattedNumber)) {
            return null; // Invalid format for the given country
        }

        return formattedNumber;
    }

    /**
     * Validates if a phone number is correctly formatted for a given country.
     * @param {string} phoneNumber - The phone number to validate.
     * @param {string} countryCode - The expected country (ISO 2-letter format).
     * @returns {boolean} - True if valid, otherwise false.
     */
    validate(phoneNumber, countryCode) {
        if (!this.countryValidations[countryCode]) {
            throw new Error(`Validation rules not defined for country: ${countryCode}`);
        }

        let parsedNumber = this.parse(phoneNumber, countryCode);
        return parsedNumber !== null;
    }

    /**
     * Adds or updates a country's validation regex.
     * @param {string} countryCode - The country's ISO 2-letter code.
     * @param {RegExp} regex - The validation regex.
     */
    addCountryValidation(countryCode, regex) {
        this.countryValidations[countryCode] = regex;
    }

    /**
     * Removes a country from the validation list.
     * @param {string} countryCode - The country's ISO 2-letter code.
     */
    removeCountryValidation(countryCode) {
        delete this.countryValidations[countryCode];
    }

    /**
     * Lists all supported countries with validation rules.
     * @returns {Object} - The country validation rules.
     */
    listSupportedCountries() {
        return this.countryValidations;
    }
}

// Example usage
const phoneParser = new PhoneNumberParser();

// Parsing examples
console.log(phoneParser.parse('1234567890', 'US')); // +11234567890
console.log(phoneParser.parse('+442071838750', 'UK')); // +442071838750
console.log(phoneParser.parse('0671234567', 'UA')); // +380671234567
console.log(phoneParser.parse('+33612345678', 'FR')); // +33612345678
console.log(phoneParser.parse('+4915123456789', 'DE')); // +4915123456789

// Validation examples
console.log(phoneParser.validate('+11234567890', 'US')); // true
console.log(phoneParser.validate('0671234567', 'UA')); // true
console.log(phoneParser.validate('abcdefgh', 'FR')); // false
console.log(phoneParser.validate('+999123456789', 'US')); // false

// Adding a new country validation (Example: Canada)
phoneParser.addCountryValidation('CA', /^\+1\d{10}$/);
console.log(phoneParser.validate('+15145551234', 'CA')); // true

// Listing supported countries
console.log(phoneParser.listSupportedCountries());

// Removing a country validation
phoneParser.removeCountryValidation('FR');
console.log(phoneParser.validate('+33612345678', 'FR')); // Throws error (Validation removed)

module.exports = { PhoneNumberParser };
