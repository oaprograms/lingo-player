
describe('tokenizer test', function () {

    var tokenizer = require('tokenizer');
    beforeEach(function () {

    });

    it('tests is_letter', function () {
        expect(tokenizer.is_letter('a')).toEqual(true);
        expect(tokenizer.is_letter('!')).toEqual(false);
        expect(tokenizer.is_letter('\t')).toEqual(false);
    });

    it('tests splitWords', function () {
        expect(tokenizer.splitWords('test')).toEqual([
            {isWord: true, text: 'test'}
        ]);

        expect(tokenizer.splitWords('Hello, world!')).toEqual([
            {text: 'Hello', isWord: true},
            {text: ', '},
            {text: 'world', isWord: true},
            {text: '!'}
        ]);

        expect(tokenizer.splitWords("!, .,?ћирилица\nOgnjen's test ")).toEqual([
            {text: '!, .,?'},
            {text: 'ћирилица', isWord: true},
            {text: '\n'},
            {text: "Ognjen's", isWord: true},
            {text: ' '},
            {text: 'test', isWord: true},
            {text: ' '}
        ]);
    });
});